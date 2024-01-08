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

function getHealthImage(healthReports: HealthReport[], size: JenkinsIconSize) {
  // Get lowest health score
  return `${imagesUrl}/${size}/` + healthReports.reduce((prev, curr) => {
    if (prev == null) return curr;
    return prev.score < curr.score ? prev : curr;
  }, null)?.iconUrl;
}

export const Extension = (props: AppViewComponentProps) => {
  const [jobs, setJobs] = useState<JenkinsJob[]>([]);
  const application = props.application;
  const applicationSpec = props.application.spec;

  useEffect(() => {
    const jenkinsPaths = applicationSpec.info?.filter(info => info.name.toLowerCase().startsWith("jenkins")) ?? [];
    if (!jenkinsPaths.length || !application.metadata.namespace || !application.metadata.name)
      return;
    const nextJobs = jenkinsPaths.map<JenkinsJobPath>(info => ({ name: info.name, path: info.value, value: null }));
    nextJobs.map(job =>
      fetch(`${baseUrl}/${job.path}/api/json`, {
        credentials: 'same-origin',
        headers: {
          "Argocd-Application-Name": `${application.metadata.namespace}:${application.metadata.name}`,
          "Argocd-Project-Name": applicationSpec.project
        }
      })
        .then(r => r.ok ? r.json() as Promise<JenkinsJob> : Promise.reject(new Error(`${r.status}: ${r.statusText}`)))
        .then(job => setJobs([...jobs, job]))
        .catch(console.error)
    );
  }, [applicationSpec]);

  return (
    <>
      <div className='jenkins-view__nodes-container'>
        {jobs.length > 0 && jobs.map(job => (
          <div className='jenkins-view__node white-box jenkins-view__node--large'>
            <div className='jenkins-view__node__container--header'>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '10px' }}>
                  <img src={getHealthImage(job.healthReport, JenkinsIconSize.Large)} style={{ padding: '2px', width: '40px', height: '32px' }} />
                </div>
                <div style={{ lineHeight: '15px' }}>
                  <b style={{ wordWrap: 'break-word' }}>{job.displayName}</b>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <a href={job.url}>
                    <i className='fa fa-external-link-alt' />
                  </a>
                </div>
              </div>
            </div>
            <div className='jenkins-view__node__container'>
              {job.healthReport.map(health => (
                <div className='row'>
                  <img src={`${imagesUrl}/${JenkinsIconSize.Small}/${health.iconUrl}`} style={{ padding: '2px', width: '16px', height: '16px' }} />
                  {health.description}
                </div>
              ))}
              <div className='row'>
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