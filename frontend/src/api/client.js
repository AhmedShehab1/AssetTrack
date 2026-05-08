/**
 * @fileoverview
 * AssetTrack — Centralized API client.
 *
 * Single Axios instance used by every hook and service in the application.
 * Responsibilities:
 *  1. Attach the JWT Bearer token to every outgoing request.
 *  2. Normalise every HTTP error into a structured `ApiError` object so
 *     the UI always deals with a predictable shape — never raw Axios errors.
 *  3. Handle token-expiry globally (401 → trigger logout).
 *
 * NOTHING in the UI layer should import `axios` directly.
 * Import `apiClient` from this file instead.
 */

import axios from 'axios';
import apiBaseUrl from '../lib/apiBaseUrl.js';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? apiBaseUrl;

const TOKEN_STORAGE_KEY = 'assettrack_access_token';

// ─────────────────────────────────────────────────────────────────────────────
// Token helpers
// Call these from your auth state / context, never from components directly.
// ─────────────────────────────────────────────────────────────────────────────

/** Persist the JWT after a successful login. */
export const storeToken = (token) =>
  localStorage.setItem(TOKEN_STORAGE_KEY, token);

/** Remove the JWT on logout or 401. */
export const clearToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

/** Read the current JWT (or null if unauthenticated). */
export const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR — inject Bearer token
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — normalise errors into ApiError
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a guaranteed-complete `ApiError` object from whatever the server
 * returned (or from a network failure).  Callers can always safely access
 * `.message`, `.status`, `.fieldErrors`, etc. without defensive checks.
 *
 * @param {import('axios').AxiosError} axiosError
 * @returns {import('./types').ApiError}
 */
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
    error: httpStatusText(status),
    message: `Unexpected server response (HTTP ${status}).`,
    path: config?.url ?? '',
    fieldErrors: [],
  };
};

/**
 * Coarse status-to-phrase mapping for unstructured server errors.
 * @param {number} status
 * @returns {string}
 */
const httpStatusText = (status) => {
  const phrases = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return phrases[status] ?? 'Unknown Error';
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

/**
 * @template T
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<T>}
 */
export const get = (url, config) =>
  apiClient.get(url, config).then((res) => res.data);

/**
 * @template T
 * @param {string} url
 * @param {unknown} [data]
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<T>}
 */
export const post = (url, data, config) =>
  apiClient.post(url, data, config).then((res) => res.data);

/**
 * @template T
 * @param {string} url
 * @param {unknown} [data]
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<T>}
 */
export const patch = (url, data, config) =>
  apiClient.patch(url, data, config).then((res) => res.data);

/**
 * @template T
 * @param {string} url
 * @param {unknown} [data]
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<T>}
 */
export const put = (url, data, config) =>
  apiClient.put(url, data, config).then((res) => res.data);

/**
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<void>}
 */
export const del = (url, config) =>
  apiClient.delete(url, config).then(() => undefined);

export default apiClient;