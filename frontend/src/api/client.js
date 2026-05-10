/**
 * @fileoverview
 * AssetTrack — Centralized API client.
 */

import axios from 'axios';
import apiBaseUrl from '../lib/apiBaseUrl.js';

const BASE_URL = apiBaseUrl;

const TOKEN_STORAGE_KEY = 'assettrack_access_token';

/** Persist the JWT after a successful login. */
export const storeToken = (token) =>
  localStorage.setItem(TOKEN_STORAGE_KEY, token);

/** Remove the JWT on logout or 401. */
export const clearToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

/** Read the current JWT (or null if unauthenticated). */
export const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const normaliseError = (axiosError) => {
  if (!axiosError.response) {
    return {
      timestamp: new Date().toISOString(),
      status: 0,
      error: 'Network Error',
      message:
        axiosError.code === 'ECONNABORTED'
          ? 'The request timed out. Please try again.'
          : 'Unable to reach the server. Check your internet connection.',
      path: axiosError.config?.url ?? '',
      fieldErrors: [],
    };
  }

  const { status, data, config } = axiosError.response;

  if (data && typeof data === 'object' && 'message' in data) {
    return {
      timestamp: data.timestamp ?? new Date().toISOString(),
      status: data.status ?? status,
      error: data.error ?? String(status),
      message: data.message,
      path: data.path ?? config?.url ?? '',
      fieldErrors: Array.isArray(data.fieldErrors) ? data.fieldErrors : [],
    };
  }

  return {
    timestamp: new Date().toISOString(),
    status,
    error: 'Error',
    message: `Unexpected server response (HTTP ${status}).`,
    path: config?.url ?? '',
    fieldErrors: [],
  };
};

apiClient.interceptors.response.use(
  (response) => response,
  (axiosError) => {
    const apiError = normaliseError(axiosError);

    if (apiError.status === 401) {
      clearToken();
      window.dispatchEvent(new CustomEvent('assettrack:unauthorised'));
    }

    return Promise.reject(apiError);
  },
);

export const get = (url, config) =>
  apiClient.get(url, config).then((res) => res.data);

export const post = (url, data, config) =>
  apiClient.post(url, data, config).then((res) => res.data);

export const patch = (url, data, config) =>
  apiClient.patch(url, data, config).then((res) => res.data);

export const put = (url, data, config) =>
  apiClient.put(url, data, config).then((res) => res.data);

export const del = (url, config) =>
  apiClient.delete(url, config).then(() => true);

export default apiClient;
