import { createContext, Fragment, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { type AuthenticationContentValues, type FormUpdateFields, type IdentityServiceAuthenticationProviderProps } from '../types/global';
import axios, { AxiosError, type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { axiosRequestInterceptor, axiosResponseInterceptor } from '../core/identity-service-axios-interceptors';
import IdentityServiceClient from '../core/identity-service-client';
import ssoImg from '../assets/sso-logo.png';
import ExpireAlert from '../components/ExpireAlert';
import IdentityServiceUserFields from '../components/IdentityServiceUserFields';
import MainActions from '../components/MainActions';

let ISClientInstance: IdentityServiceClient | undefined;

export function createIdentityServiceAxiosInstance(initConfig?: CreateAxiosDefaults): AxiosInstance {
  const instance = axios.create({
    withCredentials: true,
    ...initConfig,
  });

  instance.interceptors.request.use(async (config) => await axiosRequestInterceptor(config, ISClientInstance));

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = await axiosResponseInterceptor(error, ISClientInstance);
      return instance(config);
    },
  );

  return instance;
}

const AuthenticationContent = createContext({} as AuthenticationContentValues);
export const useIdentityServiceAuthentication = (): AuthenticationContentValues => useContext(AuthenticationContent);

const IdentityServiceAuthenticationProvider = (props: PropsWithChildren<IdentityServiceAuthenticationProviderProps>) => {
  const { appName, options, expireDate, children } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const initAndValidateISInstance = async () => {
    try {
      setIsLoading(true);
      if (initialized) return;
      setInitialized(true);

      ISClientInstance = new IdentityServiceClient(options);

      const handled = await ISClientInstance.handleCallback();

      if (handled === 'error') {
        setIsInvalid(true);
        return;
      }
      if (handled === 'check') {
        await ISClientInstance.restoreSession();
      }

      const authenticated = ISClientInstance.isAuthenticated();
      setAuthenticated(authenticated);
    } finally {
      if (initialized) return;
      setInitialized(false);
      setIsLoading(false);
    }
  };

  const handleUpdate = async (fields: FormUpdateFields) => {
    try {
      const userId = values.tokenDecoded?.sub;
      if (!userId) throw new Error('NOT FOUND USER ID');
      await ISClientInstance?.updateSpecificFields(fields.emailStr, fields.passwordStr);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  useEffect(() => {
    initAndValidateISInstance();
  }, []);

  const showAlert = useMemo(() => {
    const y = expireDate.getFullYear();
    const m = String(expireDate.getMonth() + 1).padStart(2, '0');
    const d = String(expireDate.getDate()).padStart(2, '0');

    const now = new Date();
    return { show: expireDate >= now, format: `${d}/${m}/${y}` };
  }, [expireDate]);

  const values: AuthenticationContentValues = useMemo(
    () => ({
      login: () => ISClientInstance!.login(),
      logout: () => ISClientInstance!.logout(),
      updateUserProperties: (mail, pass, photo) => ISClientInstance!.updateSpecificFields(mail, pass, photo),
      tokenDecoded: ISClientInstance?.tokenDecoded,
    }),
    [ISClientInstance, authenticated, isLoading],
  );

  const actions = ISClientInstance?.requiredActions;

  const canNext = authenticated && !isLoading && !actions?.email && !actions?.password && !!ISClientInstance;

  return (
    <AuthenticationContent.Provider value={values}>
      {canNext ? (
        children
      ) : (
        <main className="sso__main">
          <div className="sso__card">
            <img src={ssoImg} className="sso__image" alt="sso" />

            <h1 className="sso__title">{appName}</h1>

            {actions?.email || actions?.password ? (
              <IdentityServiceUserFields omitReload={false} {...actions} onSubmit={handleUpdate} />
            ) : (
              <Fragment>
                {showAlert.show && !isLoading ? <ExpireAlert dateFormat={showAlert.format} /> : null}

                <MainActions invalid={isInvalid} loading={isLoading} onLogin={() => values.login()} />
              </Fragment>
            )}
          </div>
        </main>
      )}
    </AuthenticationContent.Provider>
  );
};

export default IdentityServiceAuthenticationProvider;
