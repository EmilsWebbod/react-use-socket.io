import { useEffect, useState } from 'react';
import { reachApi } from '../api/reachApi';
import { ReachOpts, ReachError } from '../interface/api';

type AppStateTypes = 'initial' | 'busy' | 'success' | 'error' | 'empty';

interface IOpts<T> extends ReachOpts {
  endpoint: string;
  onSuccess?: (data: T) => void;
  onError?: (error: ReachError) => void;
}

export default function useReach<T>(opts: IOpts<T>) {
  const [appState, setAppState] = useState<AppStateTypes>('initial');
  const [response, setResponse] = useState<T | null>(null);
  const [error, setError] = useState<ReachError | null>(null);

  async function fetchData() {
    if (appState === 'busy') {
      return;
    }

    try {
      setAppState('busy');

      const res = await reachApi<T>(opts.endpoint, opts);

      setAppState('success');
      setResponse(res);

      if (typeof opts.onSuccess === 'function') {
        opts.onSuccess(res);
      }
    } catch (error) {
      setAppState('error');
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

  return [appState, response, error];
}
