import { useState, useCallback, useEffect } from 'react';
import { useData } from 'telefunc/react-streaming';

const useQuery = (fn, params) => {
  const rawData = useData(fn, params)
  const [data, setData] = useState(rawData);
  const [isRefetching, setIsRefetching] = useState(false);
  const [err, setErr] = useState(null);
  const refetch = useCallback(async (newParams?: object) => {
    try {
      const fnParams = {...params, ...newParams};
      setIsRefetching(true);
      setErr(null);
      setData(await fn(fnParams));
    } catch (err) {
      setErr(err);
      throw err;
    } finally {
      setIsRefetching(false);
    }
  }, [fn, params]);
  useEffect(() => {
    // Race condition: https://react.dev/reference/react/useEffect#fetching-data-with-effects
    let ignore = false;
    if (data !== rawData) {
      if (!ignore) {
        setData(rawData);
      }
    }

    return () => {
      ignore = true;
    }
  }, [rawData])
  return {
    data,
    isRefetching,
    err,
    refetch,
  }
}

export default useQuery;
