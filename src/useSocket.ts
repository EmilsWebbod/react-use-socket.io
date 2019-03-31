import { useEffect, useRef, useState } from 'react';
import * as socket from 'socket.io-client';
import { SocketProps } from './utils';

export function useSocket<T extends object>({
  url,
  namespace,
  on
}: SocketProps<T>): [
  T | null,
  (overrideNamespace?: string) => void,
  () => void
] {
  const [state, onChange] = useState<T | null>(null);
  const ref = useRef<any | null>(null);

  useEffect(() => {
    connect();
    return disconnect;
  }, []);

  function connect(overrideNamespace?: string) {
    ref.current = socket.connect(`${url}/${overrideNamespace || namespace}`);
    ref.current.on('connect', () => {
      ref.current.on(on, onChange);
    });
  }

  function disconnect() {
    if (ref.current) {
      ref.current.disconnect();
      ref.current.close();
    }
  }

  return [state, connect, disconnect];
}
