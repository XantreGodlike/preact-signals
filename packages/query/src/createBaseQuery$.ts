import {
  useComputedOnce,
  useSignalEffectOnce,
  useSignalOfReactive,
} from "@preact-signals/utils/hooks";
import type { QueryKey, QueryObserver } from "@tanstack/query-core";
import { useMemo } from "react";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import { useQueryErrorResetBoundary$ } from "./react-query/QueryErrorResetBoundary";
import {
  ensurePreventErrorBoundaryRetry,
  getHasError,
  useClearResetErrorBoundary$,
} from "./react-query/errorBoundaryUtils";
import { useIsRestoring$ } from "./react-query/isRestoring";
import { ensureStaleTime, shouldSuspend } from "./react-query/suspense";
import { StaticBaseQueryOptions, UseBaseQueryResult$ } from "./types";
import { useObserverStore } from "./useObserver";
import { wrapFunctionsInUntracked } from "./utils";
import { untracked } from "@preact-signals/unified-signals";
import { $ } from "@preact-signals/utils";

export const createBaseQuery =
  (Observer: typeof QueryObserver) =>
  <
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: () => StaticBaseQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey
    >
  ): UseBaseQueryResult$<TData, TError> => {
    const $options = useSignalOfReactive(options);
    const $queryClient = useQueryClient$({
      context: useComputedOnce(() => $options.value.context).value,
    });
    const $isRestoring = useIsRestoring$();
    const $errorBoundary = useQueryErrorResetBoundary$();
    const $suspenseBehavior = $(
      () => $options.value.suspenseBehavior ?? "load-on-access"
    );
    const $defaultedOptions = useComputedOnce(() => {
      const defaulted = wrapFunctionsInUntracked(
        $queryClient.value.defaultQueryOptions($options.value)
      );

      defaulted._optimisticResults = $isRestoring.value
        ? "isRestoring"
        : "optimistic";
      ensureStaleTime(defaulted);
      ensurePreventErrorBoundaryRetry(defaulted, $errorBoundary.value);

      return defaulted;
    });
    const $observer = useComputedOnce(
      () => new Observer($queryClient.value, $defaultedOptions.peek())
    );
    useSignalEffectOnce(() => {
      $observer.value.setOptions($defaultedOptions.value);
    });

    const state = useObserverStore(() => ({
      getCurrent: () =>
        $observer.value.getOptimisticResult(
          $defaultedOptions.value
        ) as UseBaseQueryResult$<TData, TError>,
      subscribe: (emit) =>
        $observer.value.subscribe((newValue) => {
          emit(newValue as UseBaseQueryResult$<TData, TError>);
        }),
    }));
    useClearResetErrorBoundary$($errorBoundary);

    const $shouldSuspend = $(() =>
      shouldSuspend($defaultedOptions.value, state, $isRestoring.value)
    );

    const dataComputed = useComputedOnce(() => {
      if (
        getHasError({
          result: state,
          errorResetBoundary: $errorBoundary.value,
          query: $observer.value.getCurrentQuery(),
          useErrorBoundary: $defaultedOptions.value.useErrorBoundary,
        })
      ) {
        throw state.error;
      }
      if ($shouldSuspend.value) {
        // will not refetch if already fetching
        // should suspend is not using data, so all will work fine
        throw $observer.value.fetchOptimistic($defaultedOptions.value);
      }
      return state.data;
    });
    untracked(() => {
      if (
        $shouldSuspend.value &&
        $suspenseBehavior.value !== "load-on-access"
      ) {
        try {
          dataComputed.value;
        } catch (e) {
          if ($suspenseBehavior.value === "suspend-eagerly") {
            throw e;
          }
        }
      }
    });

    const willSuspendOrThrow = useComputedOnce(() => {
      if (
        !$shouldSuspend.value ||
        $suspenseBehavior.value !== "suspend-eagerly"
      ) {
        return false;
      }

      try {
        dataComputed.value;
        return false;
      } catch {
        return true;
      }
    });
    willSuspendOrThrow.value;

    // @ts-expect-error actually it can be written
    state.dataSafe = undefined;

    return useMemo(
      () =>
        new Proxy(state, {
          get(target, prop) {
            if (prop === "data") {
              return dataComputed.value;
            }
            if (prop === "dataSafe") {
              return target.data;
            }
            // @ts-expect-error
            return Reflect.get(...arguments);
          },
        }),
      []
    );
  };
