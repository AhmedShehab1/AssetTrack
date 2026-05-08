/**
 * @fileoverview
 * AssetTrack — Example custom hooks.
 */

import { useState, useCallback } from 'react';
import { authService, assetService } from '../api/services';
import { storeToken } from '../api/client';

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

export const useLogin = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(
    authService.login,
  );

  const login = useCallback(
    async (credentials) => {
      const authResponse = await execute(credentials);
      if (authResponse) {
        storeToken(authResponse.accessToken);
      }
      return authResponse;
    },
    [execute],
  );

  return { login, loading, error, clearError };
};

export const useSignup = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(
    authService.signUp,
  );

  const signup = useCallback(
    async (credentials) => execute(credentials),
    [execute],
  );

  return { signup, loading, error, clearError };
};

export const useCreateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(
    assetService.create,
  );

  return {
    createAsset: execute,
    loading,
    error,
    clearError,
  };
};

export const useUpdateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(
    assetService.update,
  );

  return {
    updateAsset: execute,
    loading,
    error,
    clearError,
  };
};

export const useAllocateAsset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const allocate = useCallback(async (assetId, body) => {
    setLoading(true);
    setError(null);
    try {
      const { allocationService } = await import('../api/services');
      return await allocationService.allocate(assetId, body);
    } catch (apiError) {
      setError(apiError);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return { allocate, loading, error, clearError };
};