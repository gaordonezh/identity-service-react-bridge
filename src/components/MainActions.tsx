import { Fragment } from 'react';
import loaderImg from '../assets/pulse-loader.svg';

interface MainActionsProps {
  loading: boolean;
  invalid: boolean;
  onLogin: VoidFunction;
}

const MainActions = ({ invalid, loading, onLogin }: MainActionsProps) => {
  return (
    <Fragment>
      {loading ? (
        <img src={loaderImg} alt="loader" />
      ) : (
        <Fragment>
          {invalid ? (
            <p className="sso__paragraph sso__paragraph--error">Cliente inválido</p>
          ) : (
            <p className="sso__paragraph">
              Continue con el <code>SSO Netappperu SAC</code> siguiendo los pasos que se le indique...
            </p>
          )}

          <button className="sso__button sso__button--full" onClick={onLogin}>
            INGRESAR CON SSO NETAPPPERU
          </button>
        </Fragment>
      )}
    </Fragment>
  );
};

export default MainActions;
