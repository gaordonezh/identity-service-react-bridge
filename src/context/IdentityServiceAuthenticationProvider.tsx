import { createContext, Fragment, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import axios, { AxiosError, type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { type AuthenticationContentValues, type FormUpdateFields, type IdentityServiceAuthenticationProviderProps } from '../types/global';
import { axiosRequestInterceptor, axiosResponseInterceptor } from '../core/identity-service-axios-interceptors';
import IdentityServiceClient from '../core/identity-service-client';
import UpdateUserRequiredFields from '../components/UpdateUserRequiredFields';
import loaderImg from '../assets/pulse-loader.svg';
import SSOContainer from '../components/SSOContainer';

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
  const { appName, options, global, children } = props;

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

  const values: AuthenticationContentValues = useMemo(
    () => ({
      login: () => ISClientInstance!.login(),
      logout: () => ISClientInstance!.logout(),
      loginRequest: (username, password) => ISClientInstance!.loginRequest(username, password),
      updateUserProperties: (mail, pass, photo) => ISClientInstance!.updateSpecificFields(mail, pass, photo),
      tokenDecoded: ISClientInstance?.tokenDecoded,
      isUnauthorized: !!ISClientInstance?.unauthorized,
    }),
    [ISClientInstance, authenticated, isLoading],
  );

  const actions = ISClientInstance?.requiredActions;

  return (
    <AuthenticationContent.Provider value={values}>
      {isLoading ? (
        <SSOContainer name={appName}>
          <img src={loaderImg} alt="loader" />
        </SSOContainer>
      ) : (
        <Fragment>
          {authenticated ? (
            <Fragment>
              {actions?.email || actions?.password ? (
                <SSOContainer name={appName}>
                  <UpdateUserRequiredFields {...actions} onSubmit={handleUpdate} />
                </SSOContainer>
              ) : (
                <Fragment>{children}</Fragment>
              )}
            </Fragment>
          ) : (
            <Fragment>
              {isInvalid ? (
                <SSOContainer name={appName}>
                  <p className="sso__paragraph sso__paragraph--error">Cliente inválido</p>
                </SSOContainer>
              ) : (
                <Fragment>
                  {global ? (
                    <SSOContainer name={appName}>
                      {values.isUnauthorized ? (
                        <Fragment>
                          <p className="sso__paragraph">
                            Has intentado acceder a una página para la que <b>no tienes permiso</b>. Consulta los sistemas a los que tienes acceso
                            para continuar.
                          </p>
                          <button className="sso__button sso__button--full" onClick={() => (window.location.href = 'https://sso.netappperu.com')}>
                            VER MI SESIÓN
                          </button>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <p className="sso__paragraph">
                            Continue con el <b>SSO Netappperu SAC</b> y siga las instrucciones que se muestran en pantalla.
                          </p>
                          <button className="sso__button sso__button--full" onClick={() => values.login()}>
                            INGRESAR CON SSO NETAPPPERU
                          </button>
                        </Fragment>
                      )}
                    </SSOContainer>
                  ) : (
                    <Fragment>{children}</Fragment>
                  )}
                </Fragment>
              )}
            </Fragment>
          )}
        </Fragment>
      )}
    </AuthenticationContent.Provider>
  );
};

export default IdentityServiceAuthenticationProvider;
