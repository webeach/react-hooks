import { useCallback, useEffect, useRef } from 'react';

import { isErrorLike } from '../../functions/isErrorLike';
import { mapStatusStateToDemandStructure } from '../../functions/mapStatusStateToDemandStructure';
import { mapStatusToState } from '../../functions/mapStatusToState';
import { ErrorLike } from '../../types/common';
import { Status } from '../../types/status';
import { useDemandStructure } from '../useDemandStructure';
import { useLiveRef } from '../useLiveRef';
import { useRefState } from '../useRefState';
import { UseAsyncCallbackReturn } from './types';

/**
 * React hook that wraps an asynchronous function and tracks its status (`'pending'`, `'success'`, `'error'`),
 * with support for lazy reactivity and cancellation.
 *
 * By default, status updates do not trigger re-renders unless the status is accessed externally.
 * On first access, the hook automatically enables reactivity and syncs internal state to ensure consistency.
 *
 * Ensures only the latest async call affects the status by using an internal call counter
 * to prevent race conditions between overlapping executions.
 *
 * ---
 *
 * @template AsyncCallbackArgs - Tuple of argument types for the async function.
 * @template AsyncCallbackReturn - The resolved value of the async function.
 *
 * @param asyncCallback - The asynchronous function to be wrapped and monitored.
 *
 * @returns A structure with:
 * - `handler` — the wrapped async function that updates status on each call
 * - `status` — a reactive structure with flags like `isPending`, `isSuccess`, `isError`, and the `error` object
 * - `abort` — discards the result of any in-flight call and resets the status to `initial`.
 *   Note: this does **not** cancel the underlying promise (e.g. an HTTP request will keep running);
 *   it only stops the result from updating the hook's status. To cancel the work itself, pass and
 *   honor your own `AbortSignal` inside the async function.
 *
 * @example
 * const { handler: submitForm, status } = useAsyncCallback(async (data) => {
 *   const res = await fetch('/api/form', {
 *     method: 'POST',
 *     body: JSON.stringify(data),
 *   });
 *   return res.json();
 * });
 *
 * await submitForm({ name: 'Max' });
 * if (status.isError) {
 *   showToast(status.error?.message);
 * }
 *
 * @example
 * // If `status` is never accessed, status updates will not trigger re-renders:
 * const [submit] = useAsyncCallback(...);
 *
 * @see https://react-hooks.webea.ch/hooks/useAsyncCallback.html
 */
export function useAsyncCallback<
  AsyncCallbackArgs extends unknown[],
  AsyncCallbackReturn,
>(asyncCallback: (...args: AsyncCallbackArgs) => Promise<AsyncCallbackReturn>) {
  const [statusRef, setStatusState, { enableUpdate }] = useRefState<
    [Status, ErrorLike | null]
  >(['initial', null]);

  const asyncCallbackLiveRef = useLiveRef(asyncCallback);

  // Marks the latest call; `handler()` and `abort()` rotate it to invalidate stale results.
  const callTokenRef = useRef(Symbol());

  const abort = useCallback(() => {
    callTokenRef.current = Symbol();
    setStatusState(['initial', null]);
  }, []);

  const handler = useCallback(
    async (...args: AsyncCallbackArgs): Promise<AsyncCallbackReturn> => {
      const currentCallToken = (callTokenRef.current = Symbol());

      setStatusState(['pending', null]);

      try {
        const resultValue = await asyncCallbackLiveRef.current(...args);

        if (callTokenRef.current === currentCallToken) {
          setStatusState(['success', null]);
        }

        return resultValue;
      } catch (reason) {
        if (callTokenRef.current === currentCallToken) {
          setStatusState([
            'error',
            isErrorLike(reason)
              ? reason
              : typeof reason === 'string'
                ? new Error(reason)
                : null,
          ]);
        }

        throw reason;
      }
    },
    [],
  );

  useEffect(() => abort, []);

  const statusState = mapStatusToState(
    statusRef.current[0],
    statusRef.current[1],
  );

  const statusStateDemandStructure = useDemandStructure(
    mapStatusStateToDemandStructure(statusState),
  );

  return useDemandStructure([
    {
      alias: 'handler',
      accessor: () => handler,
    },
    {
      alias: 'status',
      accessor: (isInitialAccess) => {
        // Lazily enable reactivity on first external access to `status`.
        // This avoids unnecessary re-renders if the status is never used.
        if (isInitialAccess) {
          enableUpdate(true);
        }

        return statusStateDemandStructure;
      },
    },
    {
      alias: 'abort',
      accessor: () => abort,
    },
  ]) as UseAsyncCallbackReturn<AsyncCallbackArgs, AsyncCallbackReturn>;
}
