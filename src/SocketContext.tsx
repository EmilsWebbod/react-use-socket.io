import * as React from 'react';
import { Context, Provider } from 'react';
import { useSocket } from './useSocket';
import { SocketProps } from './utils';

export type SocketProviderProps<T extends object> = SocketProps<T> &
  JSX.ElementChildrenAttribute;

export function createSocketProvider<T extends object>(): [
  (props: SocketProviderProps<T>) => React.ReactNode,
  Context<T | null>
] {
  const SocketContext = React.createContext<T | null>(null);

  return [createProvider<T>(SocketContext.Provider), SocketContext];
}

function createProvider<T extends object>(ContextProvider: Provider<T | null>) {
  return function({ children, ...props }: SocketProviderProps<T>) {
    const [state] = useSocket<T>(props);

    return <ContextProvider value={state}>{children}</ContextProvider>;
  };
}
