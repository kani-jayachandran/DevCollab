import { useState, useCallback } from 'react';

/**
 * Generic hook that wraps an async AI call.
 * Returns { result, loading, error, run, reset }.
 *
 * @param {Function} apiFn  - async function that returns { data }
 */
export function useAI(apiFn) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await apiFn(...args);
      setResult(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'AI request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  const reset = useCallback(() => {
    setResult(null);
    setError('');
  }, []);

  return { result, loading, error, run, reset };
}
