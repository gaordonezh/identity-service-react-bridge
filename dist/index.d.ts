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
}

export declare const AuthenticationProvider: ({ options, expireDate, children }: PropsWithChildren<AuthenticationProviderProps>) => JSX.Element;

declare interface AuthenticationProviderProps {
    expireDate: Date;
    options: AuthClientOptions;
}

export declare function createIdentityServiceAxiosInstance(initConfig?: CreateAxiosDefaults): AxiosInstance;

export declare const useIdentityServiceAuthentication: () => AuthenticationContentValues;

export { }
