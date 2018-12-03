import 'isomorphic-fetch';
import * as qs from 'qs';
import { reachService } from './reachService';
import refreshAccessToken from './reachApi/refreshAccessToken';
import { ReachError, ReachOpts } from '../interface/api';
import { ERROR } from '../utils/constants';

export async function reachApi<T = object>(
  path: string,
  optsOverride?: ReachOpts
): Promise<T> {
  try {
    const opts: ReachOpts = {
      ...reachService.get('opts'),
      ...(optsOverride || {})
    };

    const init: RequestInit = {
      method: opts.method,
      body: getBody(opts),
      headers: getHeaders(opts)
    };

    const url = getUrl(path, opts);

    const response = await fetch(url, init);

    let data: T | null = null;

    if (response.status < 400) {
      data = opts.noJson ? response : await response.json();
    } else if (response.status === 403) {
      if (reachService.getAuth('type') === 'Bearer') {
        await refreshAccessToken();
        return await reachApi<T>(path, optsOverride);
      } else {
        throw await handle400(response);
      }
    } else if (response.status < 500) {
      throw await handle400(response);
    } else {
      throw await handle500(response);
    }

    if (!data) {
      throw reachCreateError(404, 'Fant ikke data');
    }

    return data;
  } catch (e) {
    throw e;
  }
}

function getHeaders(opts: ReachOpts) {
  if (opts.auth && (!opts.headers || !opts.headers.Authorization)) {
    const type = reachService.getAuth('type');
    const token = reachService.getAuth('token');
    if (!type) {
      throw reachCreateError(401, 'Missing Authorization "type"');
    }
    if (!token) {
      throw reachCreateError(401, 'Missing Authorization "token"');
    }

    opts.headers = {
      ...(opts.headers || {}),
      Authorization: `${type} ${token}`
    };
  }

  return reachService.combineHeaders(opts.headers);
}

function getBody(opts: ReachOpts): FormData | string | undefined {
  if (opts.method === 'GET') {
    return undefined;
  }

  opts.body = opts.body ? opts.body : {};

  if (opts.auth && opts.tokenInBody) {
    try {
      addTokenToBody(opts);
    } catch (e) {
      throw e;
    }
  }

  return Object.keys(opts.body).length > 0
    ? opts.multipart
      ? createForm(opts)
      : JSON.stringify(opts.body)
    : undefined;
}

function createForm(opts: ReachOpts): FormData {
  const formData = new FormData();
  const data = opts.body || {};
  const filesKeys = opts.filesKeys || ['files'];

  for (const k in data) {
    if (filesKeys.some(fk => fk === k) && Array.isArray(data[k])) {
      data[k].map((file: any) => formData.append(k, file));
    } else {
      formData.append(k, data[k]);
    }
  }

  return formData;
}

function getUrl(path: string, opts: ReachOpts) {
  const values = reachService.values;
  let params = '';

  if (opts.auth && opts.tokenInBody) {
    try {
      addTokenToBody(opts);
    } catch (e) {
      throw e;
    }
  }

  const queries = {
    ...opts.body,
    ...opts.query
  };

  if (opts.method === 'GET' && opts.body) {
    params = `/?${qs.stringify(queries)}`;
  }

  return `${opts.usePathAsUrl ? '' : values.url + '/'}${path}${params}`;
}

async function handle400(response: Response): Promise<ReachError> {
  let message: string =
    response.status in ERROR.STATUS
      ? ERROR.STATUS[response.status]
      : '40x feil';
  return reachCreateError(response.status, message, response);
}

async function handle500(response: Response): Promise<ReachError> {
  let text = await response.text();

  if (text.match(/<html/)) {
    const match = text.match(/Error:\s([^<&]*)/);
    if (match) {
      return reachCreateError(500, match[1], response);
    }
  }

  return reachCreateError(500, text, response);
}

export function reachCreateError(
  code: number,
  message: string,
  details?: Response
) {
  return {
    code,
    message,
    details
  };
}

function addTokenToBody(opts: ReachOpts) {
  const token = reachService.getAuth('token');

  if (!token || token === '') {
    throw reachCreateError(401, 'tokenNotProvided');
  }

  if (!opts.body) {
    opts.body = {};
  }
  opts.body.token = token;
}
