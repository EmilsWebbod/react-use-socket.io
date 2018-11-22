export type IMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IBody {
  [key: string]: any;
}

export interface IHeaders {
  [key: string]: any;
}

export interface ReachError {
  code: number;
  message: string;
  details?: Response;
}

export interface ReachOpts {
  noJson?: boolean;
  method?: IMethods;
  auth?: boolean;
  multipart?: boolean;
  filesKeys?: string[];
  body?: IBody;
  headers?: IHeaders;
}