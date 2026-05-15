import { AxiosInstance } from 'axios';
import { CreateAxiosDefaults } from 'axios';
import { JSX } from 'react/jsx-runtime';
import { PropsWithChildren } from 'react';

export declare interface AuthClientOptions {
    clientId: string;
    identityUrl: string;
    redirectUri: string;
    logoutRedirectUri: string;
}

declare interface AuthenticationContentValues {
    login(): Promise<void>;
    logout(): Promise<void>;
    refresh(): Promise<boolean>;
    tokenDecoded?: JwtDecodedPayload;
}

export declare function createIdentityServiceAxiosInstance(initConfig?: CreateAxiosDefaults): AxiosInstance;

export declare const IdentityServiceAuthenticationProvider: ({ options, expireDate, children }: PropsWithChildren<IdentityServiceAuthenticationProviderProps>) => JSX.Element;

export declare interface IdentityServiceAuthenticationProviderProps {
    expireDate: Date;
    options: AuthClientOptions;
}

export declare interface JwtDecodedPayload {
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

export declare const useIdentityServiceAuthentication: () => AuthenticationContentValues;

export { }
