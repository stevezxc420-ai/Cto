import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { getToken, removeToken } from './token';
import { normalizeApiError } from './apiError';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const parsedTimeout = Number.parseInt(process.env.REACT_APP_API_TIMEOUT || '10000', 10);
const API_TIMEOUT = Number.isFinite(parsedTimeout) ? parsedTimeout : 10000;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token) {
      if (typeof config.headers?.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        if (!config.headers) {
          config.headers = {} as Record<string, string>;
        }
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: unknown) => Promise.reject(normalizeApiError(error))
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.assign('/login?reason=expired');
    }

    return Promise.reject(normalizeApiError(error));
  }
);

const request = async <TResponse>(
  config: AxiosRequestConfig
): Promise<TResponse> => {
  try {
    const response = await apiClient.request<TResponse>(config);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const api = {
  get: <TResponse>(url: string, config?: AxiosRequestConfig) =>
    request<TResponse>({ ...config, method: 'GET', url }),

  post: <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ) => request<TResponse>({ ...config, method: 'POST', url, data }),

  put: <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ) => request<TResponse>({ ...config, method: 'PUT', url, data }),

  patch: <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ) => request<TResponse>({ ...config, method: 'PATCH', url, data }),

  delete: <TResponse>(url: string, config?: AxiosRequestConfig) =>
    request<TResponse>({ ...config, method: 'DELETE', url }),
};

export default apiClient;
