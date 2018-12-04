import { ReachOpts } from '../../interface';
import { reachService } from '../reachService';
import { reachCreateError } from '../reachApi';
import { addTokenToBody } from './reachApiBody';
import * as qs from 'qs';

export function getUrl(path: string, opts: ReachOpts) {
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

export function getHeaders(opts: ReachOpts) {
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

  if (opts.type) {
    opts.headers = {
      ...(opts.headers || {}),
      'Content-Type': opts.type
    };
  }

  return combineHeaders(opts.headers);
}

function combineHeaders(headers?: { [key: string]: string }) {
  const _headers = reachService.get('headers');

  if (!headers) {
    return _headers;
  }

  for (const header in headers) {
    _headers.set(header, headers[header]);
  }

  reachService.set('headers', _headers);
  return reachService.get('headers');
}
