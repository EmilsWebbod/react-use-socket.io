import * as React from 'react';
import { IAuthorization, ReachProviderValues } from './reachServiceTypes';

function defaultHeaders() {
  const headers = new Headers({});
  headers.set('Content-Type', 'application/json');
  return headers;
}

const defaultAuth: IAuthorization = {
  type: 'Basic',
  token: ''
};

export const defaultReachProviderValues: ReachProviderValues = {
  url: '',
  opts: {
    type: 'application/json',
    method: 'GET',
    auth: false,
    credentials: 'include'
  },
  localStorage: {
    storageKey: 'authorization',
    tokenPath: 'token',
    refreshTokenPath: 'refreshToken'
  },
  headers: defaultHeaders(),
  authorization: defaultAuth,
  StatusWrapper: ({ children }) => <>{children}</>,
  EmptyState: () => <>List is empty</>,
  BusyState: () => <>Loading...</>,
  ErrorState: ({ error }) => (
    <>
      {error.code} : {error.message}
    </>
  )
};
