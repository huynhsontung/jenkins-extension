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
  job: any;
}

export const Extension = (props: AppViewComponentProps) => {
  const [jobs, setJobs] = useState<JenkinsJob[]>([]);
  const application = props.application;

  useEffect(() => {
    const jenkinsPaths = application.spec.info?.filter(info => info.name.toLowerCase().startsWith("jenkins")) ?? [];
    if (!jenkinsPaths.length || !application.metadata.namespace || !application.metadata.name)
      return;
    setJobs(jenkinsPaths.map<JenkinsJob>(info => ({ name: info.name, path: info.value, job: null })));

    const promises = jenkinsPaths.map<Promise<Response>>(info => fetch(`/extensions/jenkins/${info.value}/api/json`, {
      credentials: 'same-origin',
      headers: {
        "Argocd-Application-Name": `${application.metadata.namespace}:${application.metadata.name}`,
        "Argocd-Project-Name": application.spec.project
      }
    }));
    Promise.all(promises).then(responses => {
      const updatedJobs = [...jobs];
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        updatedJobs[i].job = response.json();
      }
      setJobs(updatedJobs);
    });
  }, [application])

  return (
    <>
      {jobs.length > 0 && jobs.map(job => (
        <div className='view__node white-box false'>
          <b>{job.name}</b>
          <p>{job.job}</p>
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