import 'isomorphic-fetch';
import {
  ReachBusyState,
  ReachEmptyState,
  ReachErrorState,
  ReachStatusWrapper
} from '../interface/react';
import { ReachOpts } from '../interface/api';
import {
  getKeyFromObject,
  loadFromStorage,
  saveToStorage,
  setKeyToObject
} from '../utils/localStorage';
import { reachCreateError } from './reachApi';
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
  token?: string;
  refreshToken?: string;
  multipart?: boolean;
};

export interface ReachLocalStorage {
  storageKey: string;
  tokenPath: string;
  refreshTokenPath?: string;
}

export interface ReachProviderValues {
  url: string;
  headers: Headers;
  opts: ReachOpts;
  authorization: ReachBasicAuth | ReachBearerAuth;
  localStorage: ReachLocalStorage;
  StatusWrapper: ReachStatusWrapper;
  EmptyState: ReachEmptyState;
  BusyState: ReachBusyState;
  ErrorState: ReachErrorState;
}

type IAuthorization = ReachBasicAuth | ReachBearerAuth;
type ReachLocalStoragePaths = Exclude<keyof ReachLocalStorage, 'storageKey'>;

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

  public setStorage() {
    this.token = this.getAuth('token') || '';
    if ('refreshToken' in this.get('authorization')) {
      this.refreshToken =
        (this.getAuth<ReachBearerAuth>('refreshToken') as string) || '';
    }
  }

  public get<K extends keyof ReachProviderValues>(
    key: K
  ): ReachProviderValues[K] {
    return this._values[key];
  }

  public getAuth<T extends IAuthorization, K extends keyof T = keyof T>(
    key: K
  ): T[K] | null {
    if (this._values.authorization) {
      return (this._values.authorization as T)[key] as T[K];
    }
    return null;
  }

  public setAuthFromStorage() {
    this._values.authorization.token = this.token;
    if ('refreshToken' in this._values.authorization) {
      this._values.authorization.refreshToken = this.refreshToken;
    }
  }

  get values() {
    return this._values;
  }

  public setValues(values: Partial<ReachProviderValues>) {
    if (values.authorization) {
      if (!values.opts) {
        this._values.opts.auth = true;
      }
    } else {
      delete values.authorization;
    }

    this._values = {
      ...this._values,
      ...values
    };

    this.setStorage();
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

  get token(): string {
    try {
      return this.getLocalValue('tokenPath') || '';
    } catch (e) {
      throw e;
    }
  }

  set token(token: string) {
    try {
      this.setLocalValue('tokenPath', token);
      this.setAuthFromStorage();
    } catch (e) {
      throw e;
    }
  }

  get refreshToken(): string {
    try {
      return this.getLocalValue('refreshTokenPath') || '';
    } catch (e) {
      throw e;
    }
  }

  set refreshToken(refreshToken: string) {
    try {
      this.setLocalValue('refreshTokenPath', refreshToken);
      this.setAuthFromStorage();
    } catch (e) {
      throw e;
    }
  }

  public getLocalValue<K extends ReachLocalStoragePaths>(path: K) {
    const storage = loadFromStorage(this.get('localStorage').storageKey) || {};
    const storageValue = this.get('localStorage')[path];

    if (!storageValue) {
      throw reachCreateError(
        500,
        `"${path}" not provided in localstorage with ReachProvider`
      );
    }

    return getKeyFromObject(storage, storageValue.split('.'));
  }

  public setLocalValue<K extends ReachLocalStoragePaths>(path: K, value: any) {
    const storage = loadFromStorage(this.get('localStorage').storageKey) || {};
    const storageValue = this.get('localStorage')[path];

    if (!storageValue) {
      throw reachCreateError(
        500,
        `"${path}" not provided in localstorage with ReachProvider`
      );
    }

    const updated = setKeyToObject(storage, storageValue.split('.'), value);

    if (updated) {
      saveToStorage(this.get('localStorage').storageKey, updated);
    }
  }
}

function defaultHeaders() {
  const headers = new Headers({});
  headers.set('Content-Type', 'application/json');
  return headers;
}

const reachService = new ReachService();

export { reachService };
