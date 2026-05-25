/**
 * Combined return type of `useControlled`, supporting both tuple and object access.
 *
 * You can use it either as:
 * - Tuple: `[value, setValue, isControlled]`
 * - Object: `{ value, setValue, isControlled }`
 *
 * `ValueType` is inferred from `defaultValue`:
 * - `useControlled('default', value)` → `ValueType = string`, `value: string`
 * - `useControlled<string | undefined>(undefined, value)` → `value: string | undefined`
 */
export type UseControlledReturn<ValueType = unknown> =
  UseControlledReturnTuple<ValueType> & UseControlledReturnObject<ValueType>;

/**
 * Object-style return from `useControlled`.
 */
export type UseControlledReturnObject<ValueType = unknown> = {
  /**
   * The current value (controlled or internal).
   */
  value: ValueType;

  /**
   * Sets the value if uncontrolled. No-op in controlled mode.
   *
   * Accepts either a value or an updater function `(prev) => next`,
   * analogous to React's `useState` setter.
   *
   * @param nextValue - New value or updater function.
   */
  setValue: (nextValue: ValueType | ((prev: ValueType) => ValueType)) => void;

  /**
   * Whether the hook is operating in controlled mode.
   */
  isControlled: boolean;
};

/**
 * Tuple-style return from `useControlled`.
 */
export type UseControlledReturnTuple<ValueType = unknown> = readonly [
  /**
   * The current value (controlled or internal).
   */
  value: ValueType,

  /**
   * Sets the value if uncontrolled. No-op in controlled mode.
   *
   * Accepts either a value or an updater function `(prev) => next`,
   * analogous to React's `useState` setter.
   *
   * @param nextValue - New value or updater function.
   */
  setValue: (nextValue: ValueType | ((prev: ValueType) => ValueType)) => void,

  /**
   * Whether the hook is operating in controlled mode.
   */
  isControlled: boolean,
];
