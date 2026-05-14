import './assets/index.css';
// import './assets/sso-logo.png';

export { default as AuthenticationProvider } from './context/AuthenticationProvider';
export { createIdentityServiceAxiosInstance, useIdentityServiceAuthentication } from './context/AuthenticationProvider';

export type { AuthClientOptions } from './types/global';
