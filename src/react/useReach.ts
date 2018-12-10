import { useEffect, useState } from 'react';
import { reachApi } from '../api/reachApi';
import { ReachError, ReachOpts } from '../interface/api';

interface IOpts<T> extends ReachOpts {
  endpoint: string;
  onSuccess?: (data: T) => void;
  onError?: (error: ReachError) => void;
}

export function useReach<T>(
  opts: IOpts<T>
): [boolean, T | null, ReachError | null, () => Promise<void>] {
  const [busy, setBusy] = useState<boolean>(false);
  const [response, setResponse] = useState<T | null>(null);
  const [error, setError] = useState<ReachError | null>(null);

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

  useEffect(
    () => {
      fetchData();
    },
    [opts.query, opts.body]
  );

  return [busy, response, error, fetchData];
}
