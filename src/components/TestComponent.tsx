import { useIdentityServiceAuthentication } from '../context/AuthenticationProvider';
import axiosInstance from '../utils/axiosInstance';

const getMe = async () => {
  const res = await axiosInstance.get('/auth/me');
  console.log(res.data.user);
  return res.data;
};

const TestComponent = () => {
  const { logout, refresh } = useIdentityServiceAuthentication();

  return (
    <div>
      <h1>Autenticado</h1>
      {/* <p>{accessToken}</p> */}

      <button className="sso__button" onClick={logout}>
        Logout
      </button>
      <button className="sso__button" onClick={refresh}>
        Refresh
      </button>
      <button className="sso__button" onClick={getMe}>
        ME
      </button>
    </div>
  );
};

export default TestComponent;
