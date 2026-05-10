import { useCallback } from 'react';
import { authService } from '../../api/services/auth';
import { storeToken, clearToken } from '../../api/client';
import useAuthStore from '../../store/useAuthStore';
import useAsyncOperation from './useAsyncOperation';

export const useLogin = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(authService.login);
  const loginStore = useAuthStore((state) => state.login);

  const login = useCallback(
    async (credentials) => {
      const authResponse = await execute(credentials);
      if (authResponse) {
        const { accessToken, user } = authResponse;
        storeToken(accessToken);
        loginStore(user, accessToken);
      }
      return authResponse;
    },
    [execute, loginStore],
  );

  return { login, loading, error, clearError };
};

export const useSignup = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(authService.signUp);

  const signup = useCallback(
    async (credentials) => execute(credentials),
    [execute],
  );

  return { signup, loading, error, clearError };
};

export const useUpdateEmail = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(authService.updateEmail);
  return { updateEmail: execute, loading, error, clearError };
};

export const useChangePassword = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(authService.changePassword);
  return { changePassword: execute, loading, error, clearError };
};

export const useForgotPassword = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(authService.forgotPassword);

  const forgotPassword = useCallback(
    async (data) => execute(data),
    [execute],
  );

  return { forgotPassword, loading, error, clearError };
};

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logoutStore = useAuthStore((state) => state.logout);

  const logout = useCallback(() => {
    clearToken();
    logoutStore();
    // Force immediate redirection and page reset to clear all state
    window.location.replace('/login');
  }, [logoutStore]);

  return { user, token, isAuthenticated, logout };
};
