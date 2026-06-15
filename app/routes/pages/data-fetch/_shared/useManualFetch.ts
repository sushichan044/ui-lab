import { useEffect, useState } from "react";

interface ManualFetchState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
}

// The "before" pattern: imperative on-demand fetching with useEffect + useState.
// This is what on-demand data fetch looks like without Suspense — note the manual
// loading/error state and the `ignore` flag needed to avoid setting state from a
// stale request when `key` changes faster than fetches resolve. The suspense-native
// version replaces all of this with `use(promise)` under a <Suspense> boundary.
export function useManualFetch<T>(
  key: string | null,
  fetcher: (key: string) => Promise<T>,
): ManualFetchState<T> {
  const [state, setState] = useState<ManualFetchState<T>>({
    data: undefined,
    loading: false,
    error: undefined,
  });

  useEffect(() => {
    if (key === null) return;

    let ignore = false;
    setState({ data: undefined, loading: true, error: undefined });

    fetcher(key)
      .then((data) => {
        if (ignore) return;
        setState({ data, loading: false, error: undefined });
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setState({
          data: undefined,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => {
      ignore = true;
    };
  }, [key, fetcher]);

  return state;
}
