import { useCallback, useEffect, useState } from 'react';

// Loads data when the page opens. `fetcher` must be a stable function
// (defined outside the component, or wrapped in useCallback).
export function useFetch(fetcher) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, error, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, attempt]);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, error: null, loading: true }));
    setAttempt((count) => count + 1);
  }, []);

  return { ...state, reload };
}
