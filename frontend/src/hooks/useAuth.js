import useAuthStore from '../store/useAuthStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const useAuth_login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return { user, token, isAuthenticated, useAuth_login, logout };
}
