import type { BaseQueryFn, TypedLazyQueryTrigger, } from '@reduxjs/toolkit/query/react';

/**
 * Generic type for an RTK Query lazy query hook result.
 * TArg = the query argument type, TResult = the query return type.
 */
type LazyQueryHookResult<TArg, TResult> = [
  trigger: (
    arg: TArg,
  ) => ReturnType<TypedLazyQueryTrigger<TResult, TArg, BaseQueryFn>>,
  result: {
    data?: TResult;
    error?: unknown;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    isSuccess: boolean;
    isUninitialized: boolean;
  },
];

export type WithOrWithoutCohortType = 'with' | 'without' | undefined;
