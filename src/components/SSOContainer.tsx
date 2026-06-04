import { type PropsWithChildren } from 'react';
import ssoImg from '../assets/sso-logo.png';

interface SSOContainerProps {
  name: string;
}

const SSOContainer = ({ name, children }: PropsWithChildren<SSOContainerProps>) => (
  <main className="sso__main">
    <div className="sso__card">
      <img src={ssoImg} className="sso__image" alt="sso" />

      <h1 className="sso__title">{name}</h1>

      {children}
    </div>
  </main>
);

export default SSOContainer;
