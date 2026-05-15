import './assets/index.css';

export { default as IdentityServiceAuthenticationProvider } from './context/IdentityServiceAuthenticationProvider';
export { createIdentityServiceAxiosInstance, useIdentityServiceAuthentication } from './context/IdentityServiceAuthenticationProvider';

export type { AuthClientOptions, JwtDecodedPayload, IdentityServiceAuthenticationProviderProps } from './types/global';
