import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { navigateTo } from './navigation';
import apiBaseUrl from './apiBaseUrl';

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — attach JWT to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      navigateTo('/login');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
