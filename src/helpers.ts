import { Application } from './models/models';

export const BASE_URL = '/extensions/jenkins';
export const IMAGES_URL = BASE_URL + '/images';

export function getProxiedRequest(url: string | URL, application: Application) {
  return new Request(url, getProxiedRequestInit(application));
}

export function getProxiedRequestInit(application: Application): RequestInit {
  return {
    credentials: 'same-origin',
    headers: {
      'Argocd-Application-Name': `${application.metadata.namespace}:${application.metadata.name}`,
      'Argocd-Project-Name': application.spec.project,
    },
  };
}
