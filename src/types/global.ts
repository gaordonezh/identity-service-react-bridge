import type { AxiosRequestConfig } from 'axios';

export interface AuthClientOptions {
  clientId: string;
  identityUrl: string;
  redirectUri: string;
  logoutRedirectUri: string;
}

export interface AuthenticationContentValues {
  login(): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<boolean>;
  tokenDecoded?: JwtDecodedPayload;
}

export interface IdentityServiceAuthenticationProviderProps {
  expireDate: Date;
  options: AuthClientOptions;
}

export interface RetryableAxiosConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export type AuthBroadcastEvent = 'LOGIN' | 'LOGOUT' | 'SESSION_EXPIRED';

export interface JwtDecodedPayload {
  /**
   * Expiración
   */
  exp: number;
  /**
   * userId
   */
  sub: string;
  /**
   * sessionId
   */
  sid: string;

  [x: string]: any;
}
