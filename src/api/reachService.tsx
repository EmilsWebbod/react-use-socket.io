import 'isomorphic-fetch';
import {
  ReachBusyState,
  ReachEmptyState,
  ReachErrorState,
  ReachStatusWrapper
} from '../interface/react';
import { ReachOpts } from '../interface/api';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import React = require('react');

export type AuthorizationBasic = 'Basic';
export type AuthorizationBearer = 'Bearer';
export type AuthorizationTypes = AuthorizationBasic | AuthorizationBearer;

export type ReachBasicAuth = {
  type: AuthorizationBasic;
  token: string;
};

export type ReachBearerAuth = {
  type: AuthorizationBearer;
  endpoint: string;
  token: string;
  refreshToken: string;
};

export interface ReachProviderValues {
  url: string;
  headers: Headers;
  opts: ReachOpts;
  authorization: ReachBasicAuth | ReachBearerAuth;
  StatusWrapper: ReachStatusWrapper;
  EmptyState: ReachEmptyState;
  BusyState: ReachBusyState;
  ErrorState: ReachErrorState;
}

type IAuthorization = ReachBasicAuth | ReachBearerAuth;

const defaultAuth: IAuthorization = {
  type: 'Basic',
  token: ''
};

export const defaultReachProviderValues: ReachProviderValues = {
  url: '',
  opts: {
    method: 'GET',
    auth: false,
    credentials: 'include'
  },
  headers: defaultHeaders(),
  authorization: loadFromStorage('authorization') || defaultAuth,
  StatusWrapper: ({ children }) => <>{children}</>,
  EmptyState: () => <>List is empty</>,
  BusyState: () => <>Loading...</>,
  ErrorState: ({ error }) => (
    <>
      {error.code} : {error.message}
    </>
  )
};

let instance: ReachService;

class ReachService {
  private _values: ReachProviderValues = defaultReachProviderValues;
  public refreshingToken: boolean = false;

  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }

  public setAuthorization(authorization: Partial<IAuthorization>) {
    this._values.authorization = {
      ...this._values.authorization,
      ...authorization
    } as IAuthorization;
    saveToStorage('authorization', this._values.authorization);
  }

  public getAuthorization() {
    return this._values.authorization;
  }

  public get<K extends keyof ReachProviderValues>(
    key: K
  ): ReachProviderValues[K] {
    return this._values[key];
  }

  public getAuth<T extends IAuthorization, K extends keyof T = keyof T>(
    key: K
  ): T[K] {
    return (this._values.authorization as T)[key];
  }

  public setAuth<K extends keyof IAuthorization>(
    key: K,
    value: IAuthorization[K]
  ) {
    this._values.authorization[key] = value;
  }

  public clearAuth() {
    this.setAuthorization(defaultAuth);
  }

  get values() {
    return this._values;
  }

  public setValues(values: Partial<ReachProviderValues>) {
    if (values.authorization) {
      this.setAuthorization(values.authorization);
      delete values.authorization;
    }
    this._values = {
      ...this._values,
      ...values
    };
  }

  public combineHeaders(headers?: { [key: string]: string }) {
    const _headers = this._values.headers;

    if (!headers) {
      return _headers;
    }

    for (const header in headers) {
      _headers.set(header, headers[header]);
    }

    this._values.headers = _headers;
    return this._values.headers;
  }
}

function defaultHeaders() {
  const headers = new Headers({});
  headers.set('Content-Type', 'application/json');
  return headers;
}

const reachService = new ReachService();

export { reachService };
