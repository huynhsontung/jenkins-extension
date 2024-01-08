import * as React from 'react';
import { useEffect, useRef, useState } from "react";
import { Application, ApplicationTree } from './models/models'
import { JenkinsJob } from './models/jenkins';
import { BASE_URL, getProxiedRequest } from './helpers';
import { JobWidget } from './job-widget';

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const application = props.application;
  const applicationSpec = props.application.spec;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);
  }

  function handleDialogClose(e: React.SyntheticEvent<HTMLDialogElement>) {
    console.log(e.currentTarget.returnValue);
  }

  useEffect(() => {
    const jenkinsPaths = applicationSpec.info?.filter(info => info.name.toLowerCase().startsWith("jenkins")) ?? [];
    const nextJobs = jenkinsPaths.map<JenkinsJobPath>(info => ({ name: info.name, path: info.value, value: null }));
    const promises = nextJobs.map(job =>
      fetch(getProxiedRequest(`${BASE_URL}/${job.path}/api/json`, application))
        .then(r => r.ok ? r.json() as Promise<JenkinsJob> : Promise.reject(new Error(`${r.status}: ${r.statusText}`)))
    );
    Promise.all(promises)
      .then(jobs => setJobs(jobs))
      .catch(console.error);
  }, [applicationSpec]);

  return (
    <>
      <dialog ref={dialogRef} onClose={handleDialogClose}>
        <b>Build {jobToBuild?.displayName}</b>
        <form method='dialog' onSubmit={handleSubmit}>
          <label>
            environment:
            <input name="environment" defaultValue="prod" />
          </label>
          <div>
            <button value='build'>Build</button>
            <button value='cancel'>Cancel</button>
          </div>
        </form>
      </dialog>
      <div className='pod-view__nodes-container'>
        {jobs.length > 0 && jobs.map(job => (
          <JobWidget application={application} job={job} buildAction={() => {
            console.log("ActionButton clicked!");
            setJobToBuild(job);
            dialogRef?.current.showModal();
          }}></JobWidget>
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