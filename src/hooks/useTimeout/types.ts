/**
 * Callback function passed to `useTimeout`.
 *
 * Called when the timeout completes. Receives the actual delay (in ms)
 * between the hook being mounted and the callback firing.
 *
 * @param actualTime - Actual elapsed time in milliseconds since the timeout started.
 */
export type UseTimeoutCallback = (actualTime: number) => void;

/**
 * Combined return type of `useTimeout`, supporting both tuple and object access.
 *
 * You can use it either as:
 * - Tuple: `[isDone]`
 * - Object: `{ isDone }`
 */
export type UseTimeoutReturn = UseTimeoutReturnTuple & UseTimeoutReturnObject;

/**
 * Object-style return from `useTimeout`.
 */
export type UseTimeoutReturnObject = {
  /**
   * Whether the timeout has completed.
   */
  isDone: boolean;
};

/**
 * Tuple-style return from `useTimeout`.
 */
export type UseTimeoutReturnTuple = readonly [
  /**
   * Whether the timeout has completed.
   */
  isDone: boolean,
];
