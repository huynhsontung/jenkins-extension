import * as React from 'react';
import { useEffect, useState } from "react";
import { Application, ApplicationTree } from './models/models'

interface AppViewComponentProps {
  application: Application;
  tree: ApplicationTree;
}

interface JenkinsJob {
  name: string;
  path: string;
  value: any;
}

export const Extension = (props: AppViewComponentProps) => {
  const [jobs, setJobs] = useState<JenkinsJob[]>([]);
  const application = props.application;
  const applicationSpec = props.application.spec;

  useEffect(() => {
    const jenkinsPaths = applicationSpec.info?.filter(info => info.name.toLowerCase().startsWith("jenkins")) ?? [];
    if (!jenkinsPaths.length || !application.metadata.namespace || !application.metadata.name)
      return;
    const nextJobs = jenkinsPaths.map<JenkinsJob>(info => ({ name: info.name, path: info.value, value: null }));
    setJobs(nextJobs);

    const promises = nextJobs.map<Promise<Response>>(job => fetch(`/extensions/jenkins/${job.path}/api/json`, {
      credentials: 'same-origin',
      headers: {
        "Argocd-Application-Name": `${application.metadata.namespace}:${application.metadata.name}`,
        "Argocd-Project-Name": applicationSpec.project
      }
    }));
    Promise.all(promises)
      .then(async responses => {
        const updatedJobs = [...nextJobs];
        for (let i = 0; i < responses.length; i++) {
          const response = responses[i];
          updatedJobs[i].value = response.ok ? await response.json() : '';
        }
        setJobs(updatedJobs);
      });
  }, [applicationSpec]);

  return (
    <>
      {jobs.length > 0 && jobs.map(job => (
        <div className='view__node white-box false'>
          <b>{job.path}</b>
          <p>{job.value}</p>
        </div>
      ))}
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