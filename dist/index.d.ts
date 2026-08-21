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
    loginRequest(username: string, password: string): Promise<void>;
    updateUserProperties: (email: string, password: string, photo?: File) => Promise<string>;
    tokenDecoded?: JwtDecodedPayload;
    isUnauthorized: boolean;
}

export declare function createIdentityServiceAxiosInstance(initConfig?: CreateAxiosDefaults): AxiosInstance;

export declare const IdentityServiceAuthenticationProvider: (props: PropsWithChildren<IdentityServiceAuthenticationProviderProps>) => JSX.Element;

export declare interface IdentityServiceAuthenticationProviderProps {
    global: boolean;
    appName: string;
    options: AuthClientOptions;
}

export declare const InternalSystemAccessError: () => JSX.Element;

export declare interface JwtDecodedPayload {
    /**
     * User ID
     */
    sub: string;
    /**
     * Session ID
     */
    sid: string;
    jti: string;
    photo: string;
    firstname: string;
    lastname: string;
    email: string;
    iat: number;
    exp: number;
    aud: Array<string>;
    iss: string;
    [x: string]: any;
}

export declare const useIdentityServiceAuthentication: () => AuthenticationContentValues;

export { }
