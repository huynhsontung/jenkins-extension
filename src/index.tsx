import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Application, ApplicationTree } from './models/models';
import { JenkinsJob } from './models/jenkins';
import { BASE_URL, getProxiedRequest, getProxiedRequestInit } from './helpers';
import { JobWidget } from './job-widget';
import { JobForm } from './job-form';
import './styles.scss';

interface AppViewComponentProps {
  application: Application;
  tree: ApplicationTree;
}

interface JenkinsJobPath {
  name: string;
  path: string;
}

export const Extension = (props: AppViewComponentProps) => {
  const [jobs, setJobs] = useState<JenkinsJob[]>([]);
  const [jobToBuild, setJobToBuild] = useState<JenkinsJob>(null);
  const buildFormRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const application = props.application;
  const applicationSpec = props.application.spec;

  async function handleDialogClose(e: React.SyntheticEvent<HTMLDialogElement>) {
    console.log(e.currentTarget.returnValue);
    if (buildFormRef && e.currentTarget.returnValue === 'build' && jobToBuild.buildable) {
      const formData = new FormData(buildFormRef.current);
      const formJson = Object.fromEntries(formData.entries());
      console.log(formJson);
      const jobUrl = new URL(jobToBuild.url);
      const hasParams = jobToBuild.property.find(p => p.parameterDefinitions?.length > 0);
      const resp = hasParams
        ? await fetch(
            new Request(BASE_URL + jobUrl.pathname + 'buildWithParameters', {
              ...getProxiedRequestInit(application),
              method: 'post',
              body: formData,
            }),
          )
        : await fetch(
            new Request(BASE_URL + jobUrl.pathname + 'build', {
              ...getProxiedRequestInit(application),
              method: 'post',
            }),
          );
      console.log(resp);
      // force reload all jobs
      setJobs([...jobs]);
    }
  }

  useEffect(() => {
    const jenkinsPaths = applicationSpec.info?.filter(info => info.name.toLowerCase().startsWith('jenkins')) ?? [];
    const nextJobs = jenkinsPaths.map<JenkinsJobPath>(info => ({ name: info.name, path: info.value, value: null }));
    const promises = nextJobs.map(job =>
      fetch(getProxiedRequest(`${BASE_URL}/${job.path}/api/json`, application)).then(r =>
        r.ok ? (r.json() as Promise<JenkinsJob>) : Promise.reject(new Error(`${r.status}: ${r.statusText}`)),
      ),
    );
    Promise.all(promises)
      .then(jobs => setJobs(jobs))
      .catch(console.error);
  }, [application, applicationSpec]);

  return (
    <>
      <dialog ref={dialogRef} onClose={handleDialogClose}>
        <b>Build {jobToBuild?.displayName}</b>
        <JobForm jobToBuild={jobToBuild} buildFormRef={buildFormRef} />
      </dialog>
      <div className='pod-view__nodes-container'>
        {jobs.length > 0 &&
          jobs.map((job, idx) => (
            <JobWidget
              key={idx}
              application={application}
              displayName={job.displayName}
              fullName={job.fullName}
              url={job.url}
              healthReport={job.healthReport}
              lastBuildInfo={job.lastBuild}
              buildAction={() => {
                console.log('ActionButton clicked!');
                setJobToBuild(job);
                dialogRef?.current.showModal();
              }}
            />
          ))}
      </div>
    </>
  );
};

export const component = Extension;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
((window: any) => {
  window.extensionsAPI.registerAppViewExtension(component, 'Jenkins', 'fa-brands fa-jenkins');
})(window);
