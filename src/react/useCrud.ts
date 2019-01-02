import { ReachError } from '../interface';
import { FormEvent, useRef, useState } from 'react';
import { reachApi } from '../api';

interface Functions<T> {
  onEdit?: (data: T) => void;
  onDelete?: () => void;
  onCreate?: (data: T) => void;
  onSuccess?: (data?: T) => void;
}

interface Props<T> extends Functions<T> {
  url: string;
  id?: keyof T;
  data?: Partial<T>;
  edit?: Partial<ReachEdit<T>>;
}

interface State<T extends object> {
  body: Partial<T>;
  edit: ReachEdit<Partial<T>>;
  busy: boolean;
  error?: ReachError;
}

export type ReachEdit<T> = {
  [key in keyof T]: {
    type: string;
    label?: string;
    edit?: boolean;
    required?: boolean;
  }
};

interface Object {
  _id?: string;

  [key: string]: any;
}

export type ReachCrudMethods = 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ReachCrudEdit<T> = Partial<ReachEdit<T>>;

export function useCrud<T extends Object>(props: Props<T>) {
  const { url, id = '_id', data = {}, edit = {}, ...functions } = props;

  const init = useRef(false);
  const [state, setState] = useState<State<T>>({
    body: data,
    edit: createEditBody(edit, data, Boolean(init.current)),
    busy: false
  });

  async function read() {
    try {
      const dataId = data[id];
      setState({ ...state, busy: true });
      const body = await reachApi(`${url}/${dataId}`);
      setState({ ...state, body, edit: resetEdit(state.edit), busy: false });
    } catch (e) {
      setState({ ...state, error: e, busy: false });
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dataId = state.body[id];
    postData(dataId ? 'PATCH' : 'POST')();
  }

  function DELETE() {
    if (confirm('Er du sikker?')) {
      postData('DELETE')();
    }
  }

  function postData(method: ReachCrudMethods) {
    return async function() {
      if (state.busy) {
        return;
      }
      let dataId = state.body[id];

      if (method === 'POST') {
        dataId = undefined;
      } else {
        if (!dataId) {
          throw new Error('Cant PUT PATCH or DELETE without id');
        }
      }

      try {
        const body = setBody(method, state);

        if (method === 'PUT' || method === 'POST') {
          if (body) {
            delete body[id];
          }
        }

        setState({ ...state, busy: true });

        let reachUrl = url + (dataId ? `/${dataId}` : '');
        const response = await reachApi<T>(reachUrl, { method, body });

        setState({
          ...state,
          edit: resetEdit(state.edit),
          body: { ...state.body, ...response },
          busy: false,
          error: undefined
        });

        handleSuccess(method, functions, response);
      } catch (e) {
        setState({ ...state, error: e, busy: false });
      }
    };
  }

  function get<K extends keyof T>(key: K) {
    const getVal = {
      value: state.body[key],
      ...state.edit[key]
    };
    delete getVal.edit;
    return getVal;
  }

  function set<K extends keyof T>(key: K) {
    return async function(e: T[K] | any) {
      const value: T[K] =
        e && 'target' in e ? e.target && (e.target.value as T[K]) : e;

      if (state.body[key] === value) {
        return;
      }

      state.body[key] = value;
      if (!state.edit[key]) {
        state.edit[key] = {
          ...state.edit[key],
          edit: true
        };
      } else {
        state.edit[key].edit = true;
      }

      await setState({ ...state });
    };
  }

  init.current = true;
  return {
    state,
    get,
    set,
    read,
    POST: postData('POST'),
    PUT: postData('PUT'),
    PATCH: postData('PATCH'),
    DELETE,
    onSubmit
  };
}

function createEditBody<T extends object>(
  edit: Partial<ReachEdit<T>>,
  body: T,
  init?: boolean
) {
  if (init) {
    return edit as ReachEdit<T>;
  }
  const obj: Partial<ReachEdit<T>> = edit;
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      if (!obj[key] || !('edit' in obj[key])) {
        // @ts-ignore
        obj[key] = {
          ...(obj[key] ? obj[key] : {}),
          edit: false
        };
      }
    }
  }
  return obj as ReachEdit<T>;
}

function resetEdit<T extends object>(edit: ReachEdit<T>) {
  for (const key in edit) {
    if (edit.hasOwnProperty(key)) {
      edit[key].edit = false;
    }
  }
  return edit;
}

function setBody<T extends object>(method: ReachCrudMethods, state: State<T>) {
  let body;

  if (method === 'PUT' || method === 'POST') {
    body = { ...state.body };
  } else if (method === 'PATCH') {
    body = getEditedBody(state);
  }

  return body;
}

function getEditedBody<T extends object, K extends keyof T>(body: State<T>) {
  const retBody: Partial<T> = {};
  for (const key in body.body) {
    if (
      body.body.hasOwnProperty(key) &&
      body.edit[key] &&
      body.edit[key].edit
    ) {
      retBody[key] = body.body[key];
    }
  }
  return retBody;
}

function handleSuccess<T>(
  method: ReachCrudMethods,
  functions: Functions<T>,
  res: T
) {
  const { onEdit, onCreate, onDelete, onSuccess } = functions;
  switch (method) {
    case 'PUT':
    case 'PATCH':
      if (typeof onEdit === 'function') {
        onEdit(res);
      }
      break;
    case 'POST':
      if (typeof onCreate === 'function') {
        onCreate(res);
      }
      break;
    case 'DELETE':
      if (typeof onDelete === 'function') {
        onDelete();
      }
  }

  if (typeof onSuccess === 'function') {
    onSuccess(res);
  }
}
