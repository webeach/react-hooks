/**
 * Combined return type of `useNumber`, supporting both tuple and object access.
 *
 * You can use it either as:
 * - Tuple: `[value, setValue, increment, decrement, reset]`
 * - Object: `{ value, setValue, increment, decrement, reset }`
 */
export type UseNumberReturn = UseNumberReturnTuple & UseNumberReturnObject;

/**
 * Object-style return from `useNumber`.
 */
export type UseNumberReturnObject = {
  /**
   * The current numeric value.
   */
  value: number;

  /**
   * Sets the current value to the given number.
   * @param value - The new value to set.
   */
  setValue: (value: number) => void;

  /**
   * Increments the current value by the given step (default is `1`).
   * @param step - The amount to increment by.
   */
  increment: (step?: number) => void;

  /**
   * Decrements the current value by the given step (default is `1`).
   * @param step - The amount to decrement by.
   */
  decrement: (step?: number) => void;

  /**
   * Resets the value to the initial value provided to the hook.
   */
  reset: () => void;
};

/**
 * Tuple-style return from `useNumber`.
 */
export type UseNumberReturnTuple = readonly [
  /**
   * The current numeric value.
   */
  value: number,

  /**
   * Sets the current value to the given number.
   * @param value - The new value to set.
   */
  setValue: (value: number) => void,

  /**
   * Increments the current value by the given step (default is `1`).
   * @param step - The amount to increment by.
   */
  increment: (step?: number) => void,

  /**
   * Decrements the current value by the given step (default is `1`).
   * @param step - The amount to decrement by.
   */
  decrement: (step?: number) => void,

  /**
   * Resets the value to the initial value provided to the hook.
   */
  reset: () => void,
];
