import { useEffect, useRef } from 'react';
import { useCoreDispatch, useCoreSelector } from './hooks';
import { CoreState } from './reducers';
import { isEqual } from 'lodash';

export type UnknownJson = Record<string, unknown>;

export type DataStatus = 'uninitialized' | 'pending' | 'fulfilled' | 'rejected';

export interface Gen3Response<H = UnknownJson> {
  readonly data: H;
  readonly warnings?: Record<string, string>;
  readonly errors?: Record<string, string>;
}

export interface UseCoreDataResponse<T> {
  readonly data?: T;
  readonly error?: string;
  readonly isUninitialized: boolean;
  readonly isFetching: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
}

export interface CoreDataSelectorResponse<T, S = DataStatus> {
  readonly data?: T;
  readonly status: S;
  readonly error?: string;
}

export interface CoreDataSelector<T> {
  (state: CoreState): CoreDataSelectorResponse<T>;
}

export interface FetchDataActionCreator<P, A> {
  (...params: P[]): A;
}

export interface UseCoreDataHook<P, T> {
  (...params: P[]): UseCoreDataResponse<T>;
}

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const createUseCoreDataHook = <P, A, T>(
  fetchDataActionCreator: FetchDataActionCreator<P, A>,
  dataSelector: CoreDataSelector<T>,
): UseCoreDataHook<P, T> => {
  return (...params: P[]) => {
    const coreDispatch = useCoreDispatch();
    const { data, status, error } = useCoreSelector(dataSelector);
    const action = fetchDataActionCreator(...params);
    const prevParams = usePrevious<P[]>(params);

    useEffect(() => {
      if (status === 'uninitialized' || !isEqual(prevParams, params)) {
        // createDispatchHook types forces the input to AnyAction, which is
        // not compatible with thunk actions. hence, the `as any` cast. ;(
        coreDispatch(action as any); // eslint-disable-line
      }
    }, [status, coreDispatch, action, params, prevParams]);

    return {
      data,
      error,
      isUninitialized: status === 'uninitialized',
      isFetching: status === 'pending',
      isSuccess: status === 'fulfilled',
      isError: status === 'rejected',
    };
  };
};

export interface CoreDataValueSelector<T> {
  (state: CoreState): T;
}
