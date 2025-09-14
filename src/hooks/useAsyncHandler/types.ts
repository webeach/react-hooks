import { StatusStateMap, StatusStateMapTuple } from '../../types/status';

/**
 * Asynchronous function that returns a Promise and takes no arguments.
 */
export type UseAsyncHandlerFunction = () => Promise<void>;

/**
 * Return type of `useAsyncHandler` hook — includes both tuple and named object access.
 */
export type UseAsyncHandlerReturn = UseAsyncHandlerReturnTuple &
  UseAsyncHandlerReturnObject;

/**
 * Named object form of the async handler return — provides status flags and error.
 */
export type UseAsyncHandlerReturnObject = {
  status: StatusStateMapTuple & StatusStateMap;
};

/**
 * Tuple form of the async handler return — [status].
 */
export type UseAsyncHandlerReturnTuple = readonly [
  status: StatusStateMapTuple & StatusStateMap,
];
