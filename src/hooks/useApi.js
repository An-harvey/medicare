/**
 * Generic hook để gọi API với loading/error/data state
 * Usage:
 *   const { data, loading, error, execute } = useApi(getDoctors);
 *   useEffect(() => { execute({ specialtyId: 1 }); }, []);
 */
import { useState, useCallback } from 'react';

export function useApi(apiFn) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
