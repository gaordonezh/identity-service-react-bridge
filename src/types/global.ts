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

export type Listener = () => void;

export enum AuthEventEnum {
  LOGIN = 'login',
  LOGOUT = 'logout',
  TOKEN = 'token',
  RESTORED = 'session_restored',
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
