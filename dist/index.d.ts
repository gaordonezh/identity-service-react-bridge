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
    updateMailPass: (email: string, password: string) => Promise<void>;
}

export declare function createIdentityServiceAxiosInstance(initConfig?: CreateAxiosDefaults): AxiosInstance;

declare interface FormUpdateFields {
    emailStr: string;
    passwordStr: string;
}

export declare const IdentityServiceAuthenticationProvider: (props: PropsWithChildren<IdentityServiceAuthenticationProviderProps>) => JSX.Element;

export declare interface IdentityServiceAuthenticationProviderProps {
    appName: string;
    expireDate: Date;
    options: AuthClientOptions;
}

export declare const IdentityServiceUserFields: ({ email: needUpdateEmail, password: needUpdatePassword, omitReload, onSubmit, }: IdentityServiceUserFieldsProps) => JSX.Element;

declare interface IdentityServiceUserFieldsProps extends RequiredActionsProps {
    onSubmit: (data: FormUpdateFields) => Promise<boolean>;
    omitReload: boolean;
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
