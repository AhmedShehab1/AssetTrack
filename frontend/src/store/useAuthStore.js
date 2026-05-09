import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storeToken, clearToken } from '../api/client';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        storeToken(token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        clearToken();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
