import { useState, useCallback } from 'react';

/**
 * Normalises an API call with loading, error, and data states.
 * Shared by all domain-specific hooks.
 */
const useAsyncOperation = (serviceCall) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const clearError = useCallback(() => setError(null), []);
  const resetData = useCallback(() => setData(null), []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await serviceCall(...args);
        setData(result);
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

  return { execute, loading, error, data, clearError, resetData };
};

export default useAsyncOperation;
