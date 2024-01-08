import * as React from 'react';
import { useEffect, useState } from "react";
import { HealthReport, JenkinsBuild, JenkinsJob } from './models/jenkins';
import { BASE_URL, IMAGES_URL, getProxiedRequest } from './helpers';
import { Application } from './models/models';
import { ActionButton } from 'argo-ui/v2';

enum JenkinsIconSize {
  Small = '16x16',
  Medium = '24x24',
  Large = '32x32',
  XLarge = '48x48'
}

function getLowestHealthImage(healthReports: HealthReport[], size: JenkinsIconSize) {
  return `${IMAGES_URL}/${size}/` + healthReports.reduce((prev, curr) => {
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

export interface JobWidgetProps {
  application: Application;
  job: JenkinsJob;
  buildAction?: Function;
}

export const JobWidget = (props: JobWidgetProps) => {
  const [icon, setIcon] = useState<string>(null);
  const [healthIcons, setHealthIcons] = useState<string[]>([]);
  const [lastBuild, setLastBuild] = useState<JenkinsBuild>(null);
  const { application, job, buildAction } = props;

  useEffect(() => {
    const jobIconUrl = getLowestHealthImage(job.healthReport, JenkinsIconSize.Large);
    getImageBlob(getProxiedRequest(jobIconUrl, application)).then(url => {
      setIcon(url);
    }).catch(console.error);

    const imageBlobPromises = job.healthReport.map(health => getImageBlob(getProxiedRequest(`${IMAGES_URL}/${JenkinsIconSize.Small}/${health.iconUrl}`, application)));
    Promise.all(imageBlobPromises).then(urls => {
      setHealthIcons(urls);
    }).catch(console.error);

    return () => {
      if (icon) {
        const val = icon;
        setIcon(null);
        URL.revokeObjectURL(val);
      }

      if (healthIcons.length > 0) {
        const val = healthIcons;
        setHealthIcons([]);
        val.forEach(URL.revokeObjectURL);
      }
    }
  }, [job]);

  useEffect(() => {
    // fetch last build
    if (job.lastBuild?.url) {
      const lastBuildUrl = new URL(job.lastBuild.url);
      fetch(getProxiedRequest(`${BASE_URL}${lastBuildUrl.pathname}/api/json`, application))
        .then(resp => resp.ok
          ? resp.json() as Promise<JenkinsBuild>
          : Promise.reject(new Error(`${resp.status}: ${resp.statusText}`)))
        .then(setLastBuild)
        .catch(console.error);
    }
  }, [job.lastBuild]);

  return (
    <>
      <div className='pod-view__node white-box pod-view__node--large'>
        <div className='pod-view__node__container--header'>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '10px' }}>
              <img src={icon} style={{ width: '32px', height: '32px' }} />
            </div>
            <div style={{ lineHeight: '15px', display: 'flex', flexDirection: 'column' }}>
              {job.fullName.includes('/') && <span>{job.fullName.substring(0, job.fullName.lastIndexOf('/') + 1)}</span>}
              <b style={{ wordWrap: 'break-word' }}>{job.displayName}</b>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <a href={job.url} target='_blank' rel='noopener noreferrer'>
                <i className='fa fa-external-link-alt' />
              </a>
            </div>
          </div>
          <div style={{ margin: '1em 0' }}>
            {job.healthReport.map((health, i) => (
              <div>
                <img src={healthIcons.at(i)} style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                <span>{health.description}</span>
              </div>
            ))}
            {lastBuild &&
              <div>
                <span>Last build: </span>
                <a href={lastBuild.url} target='_blank' rel='noopener noreferrer'>{lastBuild.displayName}</a>
                <span>{` (${lastBuild.result})`}</span>
              </div>
            }
          </div>
        </div>
        <div className='pod-view__node__container'>
          <div className='pod-view__node__quick-start-actions'>
            <ActionButton label='Build' action={buildAction} />
          </div>
        </div>
      </div>
    </>
  )
}