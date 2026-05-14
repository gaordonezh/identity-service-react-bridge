import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { RetryableAxiosConfig } from '../types/global';
import type IdentityServiceClient from './identity-service-client';

export const axiosRequestInterceptor = async (
  config: InternalAxiosRequestConfig<any>,
  client?: IdentityServiceClient,
): Promise<InternalAxiosRequestConfig<any>> => {
  if (client) {
    let token = client.getAccessToken();

    if (!token) {
      const restored = await client.refresh();
      if (!restored) throw new Error('Unauthenticated');

      token = client.getAccessToken();
    }

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

export const axiosResponseInterceptor = async (error: AxiosError, client?: IdentityServiceClient): Promise<RetryableAxiosConfig> => {
  const originalRequest = error.config as RetryableAxiosConfig;

  if (client) {
    if (!originalRequest) return Promise.reject(error);
    if (error.response?.status !== 401) return Promise.reject(error);
    if (originalRequest._retry) return Promise.reject(error);

    originalRequest._retry = true;

    const refreshed = await client.refresh();
    if (!refreshed) {
      await client.logout();
      return Promise.reject(error);
    }

    const token = client.getAccessToken();

    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${token}`;
  }

  return originalRequest;
};
