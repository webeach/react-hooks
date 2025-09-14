import { StatusStateMap, StatusStateMapTuple } from '../../types/status';

export type UseAsyncCallbackAbortHandler = () => void;

/**
 * The return type of the `useAsyncCallback` hook.
 *
 * Contains a typed asynchronous handler function and a status state
 * that reflects the current execution status (pending, success, error).
 *
 * @template AsyncCallbackArgs - Tuple of argument types for the async function.
 * @template AsyncCallbackReturn - The resolved value of the async function.
 *
 * @property handler - The wrapped async function that manages status state automatically.
 * @property status - An object and tuple hybrid with reactive flags like `isPending`, `isSuccess`, `isError`, and `error`.
 *
 * @example
 * const [loadData, status] = useAsyncCallback(async (id: number) => {
 *   const response = await fetch(`/api/${id}`);
 *   return response.json();
 * });
 *
 * await loadData(123);
 * if (status.isError) console.error(status.error);
 */
export type UseAsyncCallbackReturn<
  AsyncCallbackArgs extends any[] = any[],
  AsyncCallbackReturn = any,
> = UseAsyncCallbackReturnTuple<AsyncCallbackArgs, AsyncCallbackReturn> &
  UseAsyncCallbackReturnObject<AsyncCallbackArgs, AsyncCallbackReturn>;

export type UseAsyncCallbackReturnObject<
  AsyncCallbackArgs extends any[] = any[],
  AsyncCallbackReturn = any,
> = {
  abort: UseAsyncCallbackAbortHandler;
  handler: (...args: AsyncCallbackArgs) => Promise<AsyncCallbackReturn>;
  status: StatusStateMapTuple & StatusStateMap;
};

export type UseAsyncCallbackReturnTuple<
  AsyncCallbackArgs extends any[] = any[],
  AsyncCallbackReturn = any,
> = readonly [
  handler: (...args: AsyncCallbackArgs) => Promise<AsyncCallbackReturn>,
  status: StatusStateMapTuple & StatusStateMap,
  abort: UseAsyncCallbackAbortHandler,
];
