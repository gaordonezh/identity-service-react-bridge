import { useIdentityServiceAuthentication } from '../context/AuthenticationProvider';

const TestComponent = () => {
  const { accessToken, logout, refresh } = useIdentityServiceAuthentication();

  return (
    <div>
      <h1>Autenticado</h1>
      <p>{accessToken}</p>

      <button className="sso__button" onClick={logout}>
        Logout
      </button>
      <button className="sso__button" onClick={refresh}>
        Refresh
      </button>
    </div>
  );
};

export default TestComponent;
