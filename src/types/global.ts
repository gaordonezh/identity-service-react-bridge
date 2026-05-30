import type { AxiosRequestConfig } from 'axios';

export interface AuthClientOptions {
  clientId: string;
  identityUrl: string;
  redirectUri: string;
  logoutRedirectUri: string;
}

export interface RequiredActionsProps {
  email: boolean;
  password: boolean;
}

export interface FormUpdateFields {
  emailStr: string;
  passwordStr: string;
}

export interface AuthenticationContentValues {
  login(): Promise<void>;
  logout(): Promise<void>;
  tokenDecoded?: JwtDecodedPayload;
  actions?: RequiredActionsProps;
}

export interface IdentityServiceAuthenticationProviderProps {
  appName: string;
  expireDate: Date;
  options: AuthClientOptions;
}

export interface RetryableAxiosConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export type AuthBroadcastEvent = 'LOGIN' | 'LOGOUT' | 'SESSION_EXPIRED';

export interface JwtDecodedPayload {
  /**
   * User ID
   */
  sub: string;
  /**
   * Session ID
   */
  sid: string;
  jti: string;
  fullname: string;
  firstname: string;
  lastname: string;
  email: string;
  iat: number;
  exp: number;
  aud: Array<string>;
  iss: string;
  [x: string]: any;
}
