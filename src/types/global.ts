import type { AxiosRequestConfig } from 'axios';

export interface AuthClientOptions {
  clientId: string;
  identityUrl: string;
  redirectUri: string;
  logoutRedirectUri: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthenticationContentValues {
  login(): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<boolean>;
}

export interface AuthenticationProviderProps {
  expireDate: Date;
  options: AuthClientOptions;
}

export interface RetryableAxiosConfig extends AxiosRequestConfig {
  _retry?: boolean;
}
