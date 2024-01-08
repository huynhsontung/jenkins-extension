import * as React from 'react';
import { Application, ApplicationTree } from './models/models'

interface AppViewComponentProps {
  application: Application;
  tree: ApplicationTree;
}

export const Extension = (props: AppViewComponentProps) => (
  <div>Hello {props.application.metadata.name}!</div>
);

export const component = Extension;

((window: any) => {
  window.extensionsAPI.registerAppViewExtension(
    component,
    "Jenkins",
    "fa-brands fa-jenkins"
  );
})(window);