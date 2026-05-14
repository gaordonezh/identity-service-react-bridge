import { createContext, Fragment, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { type AuthenticationContentValues, type AuthenticationProviderProps } from '../types/global';
import axios, { AxiosError, type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { axiosRequestInterceptor, axiosResponseInterceptor } from '../core/identity-service-axios-interceptors';
import IdentityServiceClient from '../core/identity-service-client';
import PulseLoader from '../components/PulseLoader';
import ssoImg from '../assets/sso-logo.png';

let ISClientInstance: IdentityServiceClient | undefined;

export function createIdentityServiceAxiosInstance(initConfig?: CreateAxiosDefaults): AxiosInstance {
  const instance = axios.create({
    withCredentials: true,
    timeout: 3000,
    ...initConfig,
  });

  instance.interceptors.request.use((config) => axiosRequestInterceptor(config, ISClientInstance));

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

const AuthenticationProvider = ({ options, expireDate, children }: PropsWithChildren<AuthenticationProviderProps>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const initAndValidateISInstance = async () => {
    try {
      setIsLoading(true);

      const instance = new IdentityServiceClient(options);
      ISClientInstance = instance;

      const handled = await instance.handleCallback();
      if (!handled) await instance.restoreSession();

      const authenticated = instance.isAuthenticated();
      setAuthenticated(authenticated);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAndValidateISInstance();
  }, [ISClientInstance]);

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
      refresh: () => ISClientInstance!.refresh(),
    }),
    [ISClientInstance],
  );

  return (
    <AuthenticationContent.Provider value={values}>
      {authenticated && !isLoading ? (
        children
      ) : (
        <main className="sso__main">
          {showAlert.show && !isLoading ? (
            <div className="sso__alert">
              <p className="sso__alert--icon sso__m-0">
                <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SuccessOutlinedIcon" height={32} width={32}>
                  <path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"></path>
                </svg>
              </p>
              <p className="sso__m-0">
                <b>¡IMPORTANTE!</b> La contraseña es la misma que el usuario solo para la primera vez que ingrese con el SSO, posteriormente este le
                pedirá cambiarlo. Recuerda hacerlo antes del {showAlert.format}
              </p>
            </div>
          ) : null}

          <div className="sso__card">
            <img src={ssoImg} className="sso__image" alt="sso" />

            <h1 className="sso__title">Módulo de Usuarios</h1>

            {isLoading ? (
              <PulseLoader />
            ) : (
              <Fragment>
                <p className="sso__paragraph">
                  Continue con el <code>SSO Netappperu SAC</code> siguiendo los pasos que se le indique...
                </p>

                <button className="sso__button sso__button--full" onClick={() => values.login()}>
                  INGRESAR SSO NAPCONTABLE
                </button>
              </Fragment>
            )}
          </div>
        </main>
      )}
    </AuthenticationContent.Provider>
  );
};

export default AuthenticationProvider;
