import { createContext, Fragment, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { AuthEventEnum, type AuthenticationContentValues, type AuthenticationProviderProps } from '../types/global';
import ssoImg from '../assets/sso-logo.png';
import PulseLoader from '../components/PulseLoader';

const AuthenticationContent = createContext({} as AuthenticationContentValues);

export const useIdentityServiceAuthentication = (): AuthenticationContentValues => useContext(AuthenticationContent);

const AuthenticationProvider = ({ client, expireDate, children }: PropsWithChildren<AuthenticationProviderProps>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(client.getAccessToken());

  useEffect(() => {
    const unsubLogin = client.on(AuthEventEnum.LOGIN, () => {
      setAccessToken(client.getAccessToken());
    });

    const unsubToken = client.on(AuthEventEnum.TOKEN, () => {
      setAccessToken(client.getAccessToken());
    });

    const unsubLogout = client.on(AuthEventEnum.LOGOUT, () => {
      setAccessToken(null);
    });

    async function bootstrap() {
      try {
        setIsLoading(true);

        const handled = await client.handleCallback();
        if (!handled) {
          await client.restoreSession();
        }
      } finally {
        setAccessToken(client.getAccessToken());
        setIsLoading(false);
      }
    }

    bootstrap();

    return () => {
      unsubLogin();
      unsubToken();
      unsubLogout();
    };
  }, [client]);

  const showAlert = useMemo(() => {
    const y = expireDate.getFullYear();
    const m = String(expireDate.getMonth() + 1).padStart(2, '0');
    const d = String(expireDate.getDate()).padStart(2, '0');

    const now = new Date();
    return { show: expireDate >= now, format: `${d}/${m}/${y}` };
  }, [expireDate]);

  const values: AuthenticationContentValues = useMemo(
    () => ({
      accessToken,
      login: () => client.login(),
      logout: () => client.logout(),
      refresh: () => client.refresh(),
    }),
    [accessToken, client],
  );

  console.log(accessToken);

  return (
    <AuthenticationContent.Provider value={values}>
      {!!accessToken && !isLoading ? (
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

                <button className="sso__button sso__button--full" onClick={() => client.login()}>
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
