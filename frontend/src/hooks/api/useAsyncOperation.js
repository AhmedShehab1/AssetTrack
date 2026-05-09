import { useState, useCallback } from 'react';

/**
 * Normalises an API call with loading and error states.
 * Shared by all domain-specific hooks.
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

export default useAsyncOperation;
