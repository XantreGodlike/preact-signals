"use client";
import { Reactive } from "@preact-signals/utils";
import {
    useSignalEffectOnce,
    useSignalOfReactive,
} from "@preact-signals/utils/hooks";
import type {
    DefaultedQueryObserverOptions,
    Query,
    QueryKey,
    QueryObserverResult,
    UseErrorBoundary,
} from "@tanstack/query-core";
import * as React from "react";
import type { QueryErrorResetBoundaryValue } from "./QueryErrorResetBoundary";
import { shouldThrowError } from "./utils";

export const ensurePreventErrorBoundaryRetry = <
  TQueryFnData,
  TError,
  TData,
  TQueryData,
  TQueryKey extends QueryKey
>(
  options: DefaultedQueryObserverOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >,
  errorResetBoundary: QueryErrorResetBoundaryValue
) => {
  if (options.suspense || options.useErrorBoundary) {
    // Prevent retrying failed query if the error boundary has not been reset yet
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};

export const useClearResetErrorBoundary = (
  errorResetBoundary: QueryErrorResetBoundaryValue
) => {
  React.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
export const useClearResetErrorBoundary$ = (
  errorResetBoundary: Reactive<QueryErrorResetBoundaryValue>
): void => {
  const $boundary = useSignalOfReactive(errorResetBoundary);
  useSignalEffectOnce(() => {
    $boundary.value.clearReset();
  });
};

export const getHasError = <
  TData,
  TError,
  TQueryFnData,
  TQueryData,
  TQueryKey extends QueryKey
>({
  result,
  errorResetBoundary,
  useErrorBoundary,
  query,
}: {
  result: QueryObserverResult<TData, TError>;
  errorResetBoundary: QueryErrorResetBoundaryValue;
  useErrorBoundary: UseErrorBoundary<
    TQueryFnData,
    TError,
    TQueryData,
    TQueryKey
  >;
  query: Query<TQueryFnData, TError, TQueryData, TQueryKey>;
}) => {
  return (
    result.isError &&
    !errorResetBoundary.isReset() &&
    !result.isFetching &&
    shouldThrowError(useErrorBoundary, [result.error, query])
  );
};
