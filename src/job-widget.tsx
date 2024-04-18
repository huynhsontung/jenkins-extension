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
    if (!pollRate) return;

    // fetch last build
    const fetchLastBuild = () => {
      const pathName = new URL(url).pathname;
      fetch(getProxiedRequest(`${BASE_URL}/${pathName}/lastBuild/api/json`, application))
        .then(resp => (resp.ok ? (resp.json() as Promise<JenkinsBuild>) : Promise.reject(new Error(`${resp.status}: ${resp.statusText}`))))
        .then(setLastBuild)
        .catch(console.error);
      console.log('Polling!');
    };

    fetchLastBuild();
    const interval = setInterval(fetchLastBuild, pollRate);
    return () => {
      clearInterval(interval);
    };
  }, [url, pollRate]);

  return (
    <>
      <div className='pod-view__node white-box pod-view__node--large' style={{ display: 'flex', flexDirection: 'column' }}>
        <div className='pod-view__node__container--header'>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '10px' }}>
              <img src={icon} style={{ width: '32px', height: '32px' }} alt='Jenkins Icon' />
            </div>
            <div style={{ lineHeight: '15px', display: 'flex', flexDirection: 'column' }}>
              {fullName.includes('/') && <span>{fullName.substring(0, fullName.lastIndexOf('/') + 1)}</span>}
              <b style={{ wordWrap: 'break-word' }}>{displayName}</b>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <a href={url} target='_blank' rel='noopener noreferrer'>
                <i className='fa fa-external-link-alt' />
              </a>
            </div>
          </div>
          <div style={{ margin: '1em 0' }}>
            {healthReport.map((health, idx) => (
              <div key={idx}>
                <img src={healthIcons.at(idx)} style={{ width: '16px', height: '16px', marginRight: '8px' }} alt='Jenkins Build Health Icon' />
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
