import './assets/main.css';

export { default as IdentityServiceAuthenticationProvider } from './context/IdentityServiceAuthenticationProvider';
export { createIdentityServiceAxiosInstance, useIdentityServiceAuthentication } from './context/IdentityServiceAuthenticationProvider';
export { default as InternalSystemAccessError } from './components/InternalSystemAccessError';

export type { AuthClientOptions, JwtDecodedPayload, IdentityServiceAuthenticationProviderProps } from './types/global';
