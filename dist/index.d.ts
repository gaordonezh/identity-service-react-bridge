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
    tokenDecoded?: JwtDecodedPayload;
    actions?: RequiredActionsProps;
}

export declare function createIdentityServiceAxiosInstance(initConfig?: CreateAxiosDefaults): AxiosInstance;

export declare const IdentityServiceAuthenticationProvider: (props: PropsWithChildren<IdentityServiceAuthenticationProviderProps>) => JSX.Element;

export declare interface IdentityServiceAuthenticationProviderProps {
    appName: string;
    expireDate: Date;
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

declare interface RequiredActionsProps {
    email: boolean;
    password: boolean;
}

export declare const useIdentityServiceAuthentication: () => AuthenticationContentValues;

export { }
