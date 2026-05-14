import type { AuthClient } from '../utils/auth';

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
  accessToken: string | null;
  login(): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<boolean>;
}

export interface AuthenticationProviderProps {
  client: AuthClient;
  expireDate: Date;
}
