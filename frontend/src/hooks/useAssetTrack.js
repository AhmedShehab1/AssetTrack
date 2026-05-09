1/**
 * @fileoverview
 * AssetTrack — Centralised custom hooks for API operations.
 *
 * Uses the `useAsyncOperation` pattern for consistent loading/error state.
 */

import { useState, useCallback } from 'react';
import { authService, assetService, allocationService } from '../api/services';
import { storeToken } from '../api/client';
import useAuthStore from '../store/useAuthStore';

// ── GENERIC WRAPPER ──────────────────────────────────────────────────────────

/**
 * Normalises an API call with loading and error states.
 */
const useAsyncOperation = (serviceCall) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await serviceCall(...args);
        return result;
      } catch (apiError) {
        setError(apiError);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [serviceCall],
  );

  return { execute, loading, error, clearError };
};

// ── AUTH HOOKS ───────────────────────────────────────────────────────────────

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

// ── ASSET HOOKS ──────────────────────────────────────────────────────────────

export const useCreateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(assetService.create);
  return { createAsset: execute, loading, error, clearError };
};

export const useUpdateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(assetService.update);
  return { updateAsset: execute, loading, error, clearError };
};

export const useDeleteAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(assetService.delete);
  return { deleteAsset: execute, loading, error, clearError };
};

// ── ALLOCATION HOOKS ─────────────────────────────────────────────────────────

export const useAllocateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(allocationService.allocate);
  return { allocate: execute, loading, error, clearError };
};

export const useDeallocateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(allocationService.deallocate);
  return { deallocate: execute, loading, error, clearError };
};