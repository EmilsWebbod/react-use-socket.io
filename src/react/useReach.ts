import { useEffect } from 'react';
import { reachApi } from '../api/reachApi';
import { ReachError, ReachOpts } from '../interface/api';
import useSafeState from '../utils/useSafeState';

interface IOpts<T> extends ReachOpts {
  endpoint: string;
  onSuccess?: (data: T) => void;
  onError?: (error: ReachError) => void;
}

export function useReach<T>(
  opts: IOpts<T>
): [boolean, T | null, ReachError | null, () => Promise<void>] {
  const [busy, setBusy] = useSafeState<boolean>(false);
  const [response, setResponse] = useSafeState<T | null>(null);
  const [error, setError] = useSafeState<ReachError | null>(null);

  async function fetchData() {
    if (busy) {
      return;
    }

    try {
      setBusy(true);

      const res = await reachApi<T>(opts.endpoint, opts);

      setBusy(false);
      setResponse(res);

      if (typeof opts.onSuccess === 'function') {
        opts.onSuccess(res);
      }
    } catch (error) {
      setBusy(false);
      setError(error);

      if (typeof opts.onError === 'function') {
        opts.onError(error);
      }
    }
  }

  const queryId = Object.keys(opts.query || {}).join(',');
  const bodyId = Object.keys(opts.body || {}).join(',');
  useEffect(
    () => {
      fetchData();
    },
    [queryId, bodyId]
  );

  return [busy, response, error, fetchData];
}
