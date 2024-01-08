import * as React from 'react';
import { useEffect, useState } from "react";
import { Application, ApplicationTree } from './models/models'
import { HealthReport, JenkinsJob } from './models/jenkins';
import { ActionButton } from 'argo-ui/v2';

interface AppViewComponentProps {
  application: Application;
  tree: ApplicationTree;
}

interface JenkinsJobPath {
  name: string;
  path: string;
}

enum JenkinsIconSize {
  Small = '16x16',
  Medium = '24x24',
  Large = '32x32',
  XLarge = '48x48'
}

const baseUrl = "/extensions/jenkins";
const imagesUrl = baseUrl + "/images"

function getLowestHealthImage(healthReports: HealthReport[], size: JenkinsIconSize) {
  return `${imagesUrl}/${size}/` + healthReports.reduce((prev, curr) => {
    if (prev == null) return curr;
    return prev.score < curr.score ? prev : curr;
  }, null)?.iconUrl;
}

async function getImageBlob(req: Request) {
  try {
    const resp = await fetch(req);
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(error);
    return '';
  }
}

export const Extension = (props: AppViewComponentProps) => {
  const [jobs, setJobs] = useState<JenkinsJob[]>([]);
  const [jobIcons, setJobIcons] = useState<Map<string, string>>(new Map<string, string>());
  const [healthIcons, setHealthIcons] = useState<Map<string, string[]>>(new Map<string, string[]>());
  const application = props.application;
  const applicationSpec = props.application.spec;

  function getProxiedRequest(url: string | URL) {
    return new Request(url, {
      credentials: 'same-origin',
      headers: {
        "Argocd-Application-Name": `${application.metadata.namespace}:${application.metadata.name}`,
        "Argocd-Project-Name": applicationSpec.project
      }
    })
  }

  useEffect(() => {
    const jenkinsPaths = applicationSpec.info?.filter(info => info.name.toLowerCase().startsWith("jenkins")) ?? [];
    const nextJobs = jenkinsPaths.map<JenkinsJobPath>(info => ({ name: info.name, path: info.value, value: null }));
    const promises = nextJobs.map(job =>
      fetch(getProxiedRequest(`${baseUrl}/${job.path}/api/json`))
        .then(r => r.ok ? r.json() as Promise<JenkinsJob> : Promise.reject(new Error(`${r.status}: ${r.statusText}`)))
    );
    Promise.all(promises)
      .then(jobs => setJobs(jobs))
      .catch(console.error);
  }, [applicationSpec]);

  useEffect(() => {
    jobs.forEach(job => {
      const jobIconUrl = getLowestHealthImage(job.healthReport, JenkinsIconSize.Large);
      getImageBlob(getProxiedRequest(jobIconUrl)).then(url => {
        setJobIcons(new Map(jobIcons.set(job.fullName, url)));
      }).catch(console.error);

      const imageBlobPromises = job.healthReport.map(health => getImageBlob(getProxiedRequest(`${imagesUrl}/${JenkinsIconSize.Small}/${health.iconUrl}`)));
      Promise.all(imageBlobPromises).then(urls => {
        setHealthIcons(new Map(healthIcons.set(job.fullName, urls)));
      }).catch(console.error);
    });

    return () => {
      jobIcons.forEach(url => url && URL.revokeObjectURL(url));
      setJobIcons(new Map());
      healthIcons.forEach(urls => urls.forEach(url => url && URL.revokeObjectURL(url)));
      setHealthIcons(new Map());
    }
  }, [jobs])

  return (
    <>
      <div className='pod-view__nodes-container'>
        {jobs.length > 0 && jobs.map(job => (
          <div className='pod-view__node white-box pod-view__node--large'>
            <div className='pod-view__node__container--header'>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '10px' }}>
                  <img src={jobIcons.get(job.fullName)} style={{ width: '32px', height: '32px' }} />
                  <br />
                  <div>project</div>
                </div>
                <div style={{ lineHeight: '15px' }}>
                  {job.fullName.includes('/') && <span>{job.fullName.substring(0, job.fullName.lastIndexOf('/') + 1)}</span>}
                  <b style={{ wordWrap: 'break-word' }}>{job.displayName}</b>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <a href={job.url}>
                    <i className='fa fa-external-link-alt' />
                  </a>
                </div>
              </div>
              <div style={{ margin: '1em 0' }}>
                {job.healthReport.map((health, i) => (
                  <div>
                    <img src={healthIcons.get(job.fullName)?.at(i)} style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    <span>{health.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='pod-view__node__container'>
              <div className='pod-view__node__quick-start-actions'>
                <ActionButton label='Build' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export const component = Extension;

((window: any) => {
  window.extensionsAPI.registerAppViewExtension(
    component,
    "Jenkins",
    "fa-brands fa-jenkins"
  );
})(window);