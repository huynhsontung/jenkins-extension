import * as React from 'react';
import { useEffect, useState } from 'react';
import { HealthReport, JenkinsBuild } from './models/jenkins';
import { BASE_URL, IMAGES_URL, getProxiedRequest } from './helpers';
import { Application } from './models/models';
import { ActionButton } from 'argo-ui/v2';

enum JenkinsIconSize {
  Small = '16x16',
  Medium = '24x24',
  Large = '32x32',
  XLarge = '48x48',
}

function getLowestHealthImage(healthReports: HealthReport[], size: JenkinsIconSize) {
  return (
    `${IMAGES_URL}/${size}/` +
    healthReports.reduce((prev, curr) => {
      if (prev == null) return curr;
      return prev.score < curr.score ? prev : curr;
    }, null)?.iconUrl
  );
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
  displayName: string;
  fullName: string;
  url: string;
  healthReport: HealthReport[];
  pollRate?: number;
  buildAction?: () => void;
}

export const JobWidget = ({ application, displayName, fullName, url, healthReport, buildAction, pollRate }: JobWidgetProps) => {
  const [icon, setIcon] = useState<string>(null);
  const [healthIcons, setHealthIcons] = useState<string[]>([]);
  const [lastBuild, setLastBuild] = useState<JenkinsBuild>(null);

  useEffect(() => {
    const jobIconUrl = getLowestHealthImage(healthReport, JenkinsIconSize.Large);
    getImageBlob(getProxiedRequest(jobIconUrl, application))
      .then(url => {
        setIcon(url);
      })
      .catch(console.error);

    const imageBlobPromises = healthReport.map(health => getImageBlob(getProxiedRequest(`${IMAGES_URL}/${JenkinsIconSize.Small}/${health.iconUrl}`, application)));
    Promise.all(imageBlobPromises)
      .then(urls => {
        setHealthIcons(urls);
      })
      .catch(console.error);

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
    };
  }, [healthReport]);

  useEffect(() => {
    // Effect does nothing if pollrate is null
    if (!pollRate) return;

    const fetchLastBuild = () => {
      const pathName = new URL(url).pathname;
      fetch(getProxiedRequest(`${BASE_URL}/${pathName}/lastBuild/api/json`, application))
        .then(resp => (resp.ok ? (resp.json() as Promise<JenkinsBuild>) : Promise.reject(new Error(`${resp.status}: ${resp.statusText}`))))
        .then(setLastBuild)
        .catch(console.error);
    };

    fetchLastBuild(); // Execute first fetch
    const interval = setInterval(fetchLastBuild, pollRate); // Set interval to fetch again every pollRate ms

    // When effect is finished executing, clear interval
    return () => {
      clearInterval(interval);
    };
  }, [url, pollRate, application]);

  return (
    <>
      <div className='pod-view__node white-box pod-view__node--large job-widget' style={{ display: 'flex', flexDirection: 'column' }}>
        <div className='pod-view__node__container--header'>
          <div className='job-widget__info'>
            <div className='job-widget__info-icon'>
              <img src={icon} alt='Jenkins Icon' />
            </div>
            <div className='job-widget__info-name'>
              {fullName.includes('/') && <span>{fullName.substring(0, fullName.lastIndexOf('/') + 1)}</span>}
              <b>{displayName}</b>
            </div>
            <div className='job-widget__info-link'>
              <a href={url} target='_blank' rel='noopener noreferrer'>
                <i className='fa fa-external-link-alt' />
              </a>
            </div>
          </div>
          <div className='job-widget__healthReport'>
            {healthReport.map((health, idx) => (
              <div key={idx}>
                <img src={healthIcons.at(idx)} className='job-widget__healthReport-icon' alt='Jenkins Build Health Icon' />
                <span>{health.description}</span>
              </div>
            ))}
            {lastBuild && (
              <div>
                <span>Last build: </span>
                <a href={lastBuild.url} target='_blank' rel='noopener noreferrer'>
                  {lastBuild.displayName}
                </a>
                <span>{` (${lastBuild.result ?? 'Building'})`}</span>
              </div>
            )}
          </div>
        </div>
        <div className='pod-view__node__container'>
          <div className='pod-view__node__quick-start-actions'>
            <ActionButton label='Build' action={buildAction} />
          </div>
        </div>
      </div>
    </>
  );
};
