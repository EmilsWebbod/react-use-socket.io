import * as React from 'react';
import { isEqual } from 'lodash';
import ReachResourceState, {
  IResourceState
} from './reachResource/ReachResourceState';
import { reachApi } from '../api';
import {
  ReachBusyState,
  ReachEmptyState,
  ReachErrorState,
  ReachStatusWrapper
} from '../interface/react';

export interface IReachOpts<T, U = null> {
  background?: boolean;
  endpoint?: string;
  secondaryEndpoint?: string;
  cb: (response: T, secondaryResponse?: U) => any;
}

export type IPutField = (fields: string[], data: any) => void;

export interface IReachChildrenProps<T, U = null> {
  busy: boolean;
  data: T | null;
  secondaryData?: U | null;
  refresh: (opts?: IReachOpts<T, U>) => void;
  putField: IPutField;
}

export interface IReachProps<T, U = null> {
  endpoint: string;
  EmptyState?: ReachEmptyState;
  BusyState?: ReachBusyState;
  ErrorState?: ReachErrorState;
  StatusWrapper?: ReachStatusWrapper;
  noEmptyState?: boolean;
  noBusyState?: boolean;
  params?: object;
  secondaryEndpoint?: string;
  secondaryParams?: object;
  dontFetch?: boolean;
  afterFetch?: (data: T | null, secondaryData: U | null) => void;
  children: (obj: IReachChildrenProps<T, U>) => JSX.Element | null;
}

interface IState<T, U = null> {
  busy: boolean;
  data: T | null;
  secondaryData: U | null;
  errorStatus: number;
  error: string;
}

export class ReachResource<T, U = null> extends React.Component<
  IReachProps<T, U>,
  IState<T, U>
> {
  state = {
    busy: false,
    data: null,
    secondaryData: null,
    errorStatus: 0,
    error: ''
  };

  componentDidMount() {
    const { dontFetch, afterFetch } = this.props;

    if (!dontFetch) {
      this.fetch().then(({ data, secondaryData }) => {
        if (typeof afterFetch === 'function') {
          afterFetch(data, secondaryData);
        }
      });
    }
  }

  componentDidUpdate(prevProps: IReachProps<T, U>) {
    const { endpoint, dontFetch, afterFetch, params } = this.props;
    if (
      !dontFetch &&
      (prevProps.endpoint !== endpoint || !isEqual(prevProps.params, params))
    ) {
      this.fetch().then(({ data, secondaryData }) => {
        if (typeof afterFetch === 'function') {
          afterFetch(data, secondaryData);
        }
      });
    }
  }

  render() {
    const {
      children,
      EmptyState,
      BusyState,
      ErrorState,
      StatusWrapper
    } = this.props;
    const { busy, data, secondaryData, error, errorStatus } = this.state;

    const childrenObj: IReachChildrenProps<T, U> = {
      busy,
      data,
      refresh: this.fetch,
      putField: this.putField
    };
    if (secondaryData) {
      childrenObj.secondaryData = secondaryData;
    }

    return (
      <ReachResourceState
        state={this.getState()}
        StatusWrapper={StatusWrapper}
        BusyState={BusyState}
        ErrorState={ErrorState}
        errorStatus={errorStatus}
        error={error}
        EmptyState={EmptyState}
      >
        {children(childrenObj)}
      </ReachResourceState>
    );
  }

  public fetch = async (
    opts?: IReachOpts<T, U>
  ): Promise<{ data: T | null; secondaryData: U | null }> => {
    const { params } = this.props;

    const background = (opts && opts.background) || false;
    const cb = (opts && opts.cb) || undefined;
    const endpoint = (opts && opts.endpoint) || this.props.endpoint;
    const secondaryEndpoint =
      (opts && opts.secondaryEndpoint) || this.props.secondaryEndpoint;

    try {
      if (!background) {
        this.setState({
          busy: true
        });
      }

      const requests: Array<Promise<T | U>> = [
        reachApi<T>(endpoint, { body: params })
      ];
      if (secondaryEndpoint) {
        requests.push(reachApi<U>(secondaryEndpoint, { body: params }));
      }

      const [primary, secondary]: any = await Promise.all(requests);
      const state: any = {
        busy: false,
        error: null,
        errorStatus: 0,
        data:
          primary && !(Array.isArray(primary) && primary.length === 0)
            ? primary
            : null
      };

      if (secondary) {
        state.secondaryData =
          secondary && !(Array.isArray(secondary) && secondary.length === 0)
            ? secondary
            : null;
      }

      this.setState(state);

      if (typeof cb === 'function') {
        cb(primary, secondary);
      }

      return { data: primary, secondaryData: secondary };
    } catch (error) {
      this.setState({
        busy: false,
        data: null,
        secondaryData: null,
        errorStatus: error.code,
        error: error.message
      });
      return { data: null, secondaryData: null };
    }
  };

  private getState(): IResourceState {
    const { noEmptyState, noBusyState } = this.props;
    const { busy, data, errorStatus } = this.state;

    if (errorStatus) {
      return errorStatus;
    }

    if (!noBusyState && busy) {
      return 'busy';
    }

    if (noEmptyState || data) {
      return 'data';
    }

    return 'empty';
  }

  public putField = (fields: string[], updateData: any) => {
    const { data } = this.state;
    if (data && updateData._id) {
      const works = this.traverseFields(data, fields, 0, updateData._id);
      const fieldIndexes = works.split(',');
      const updated = this.updateDataFromTraverse(
        fieldIndexes,
        0,
        data,
        updateData
      );
      this.setState({
        data: updated
      });
    } else {
      throw new Error(
        'Failed to putField: Resource Data is null or updateData has no _id value'
      );
    }
  };

  private traverseFields = (
    data: any,
    fields: string[],
    stepIndex: number,
    id: string
  ): string => {
    let indexes = '';
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const arrIndex = this.traverseFields(d, fields, stepIndex, id);
        if (arrIndex !== '') {
          indexes += `${i},${arrIndex}`;
        }
      }
    } else if (fields[stepIndex] && data[fields[stepIndex]]) {
      const objIndex = this.traverseFields(
        data[fields[stepIndex]],
        fields,
        stepIndex + 1,
        id
      );
      if (objIndex) {
        indexes += `${fields[stepIndex]},${objIndex}`;
      }
    } else if (data._id && data._id === id) {
      return `true`;
    }
    return indexes;
  };

  private updateDataFromTraverse = (
    path: string[],
    pathIndex: number,
    data: any,
    set: any
  ) => {
    if (path[pathIndex] === 'true') {
      return set;
    }
    data[path[pathIndex]] = this.updateDataFromTraverse(
      path,
      pathIndex + 1,
      data[path[pathIndex]],
      set
    );
    return data;
  };
}
