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

export type AuthorizationTypes = 'Basic' | 'Bearer';

export interface ReachProviderValues {
  url: string;
  headers: Headers;
  opts: ReachOpts;
  authorization: IAuthorization;
  StatusWrapper: ReachStatusWrapper;
  EmptyState: ReachEmptyState;
  BusyState: ReachBusyState;
  ErrorState: ReachErrorState;
}

export interface IAuthorization {
  endPoint: string;
  refreshingToken: boolean;
  type?: AuthorizationTypes;
  token?: string;
  refreshToken?: string;
}

const defaultAuth: IAuthorization = {
  endPoint: '',
  refreshingToken: false,
  type: 'Basic',
  token: '',
  refreshToken: ''
};

export const defaultReachProviderValues: ReachProviderValues = {
  url: '',
  opts: {
    method: 'GET',
    auth: false
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
    };
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

  public getAuth<K extends keyof IAuthorization>(key: K): IAuthorization[K] {
    return this._values.authorization[key];
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
  }
}

function defaultHeaders() {
  const headers = new Headers({});
  headers.set('Content-Type', 'application/json');
  return headers;
}

const reachService = new ReachService();

export { reachService };
