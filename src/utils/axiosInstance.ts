import { createIdentityServiceAxiosInstance } from '../context/AuthenticationProvider';

const axiosInstance = createIdentityServiceAxiosInstance({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
