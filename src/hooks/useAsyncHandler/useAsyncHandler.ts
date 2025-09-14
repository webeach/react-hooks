import { DependencyList, useEffect } from 'react';

import { __DEVELOPMENT__ } from '../../constants/common';
import { ErrorLike } from '../../types/common';
import { useAsyncCallback } from '../useAsyncCallback';
import { useDemandStructure } from '../useDemandStructure';

import { UseAsyncHandlerFunction, UseAsyncHandlerReturn } from './types';

/**
 * React hook that automatically executes an asynchronous function on mount and when dependencies change,
 * while tracking its execution status (`isPending`, `isSuccess`, `isError`, `error`).
 *
 * Internally uses `useAsyncCallback` and triggers the provided handler once on mount or whenever `deps` change.
 * Cancellation (`abort`) is handled automatically on unmount via internal effect.
 *
 * If manual control over the async call (e.g. manual `abort` or repeated calls) is needed,
 * consider using `useAsyncCallback` directly.
 *
 * @param handler - An async function to be executed automatically.
 * @param deps - Dependency list for re-execution, similar to `useEffect`.
 * @returns A structure containing the current status of the async operation.
 *
 * @example
 * const { status } = useAsyncHandler(async () => {
 *   const res = await fetch('/api/data');
 *   return res.json();
 * }, []);
 *
 * if (status.isPending) return <Spinner />;
 * if (status.isError) return <Error message={status.error?.message} />;
 * return <DataView />;
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useAsyncHandler.md
 */
export function useAsyncHandler(
  handler: UseAsyncHandlerFunction,
  deps: DependencyList,
): UseAsyncHandlerReturn {
  const asyncCallbackObject = useAsyncCallback(handler);

  useEffect(() => {
    asyncCallbackObject.handler().catch((reason: ErrorLike | null) => {
      if (__DEVELOPMENT__) {
        console.error(reason);
      }
    });
  }, deps);

  return useDemandStructure([
    {
      alias: 'status',
      accessor: () => asyncCallbackObject.status,
    },
  ]);
}
