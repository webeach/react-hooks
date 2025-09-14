/**
 * Combined return type of `useControlled`, supporting both tuple and object access.
 *
 * You can use it either as:
 * - Tuple: `[value, setValue, isControlled]`
 * - Object: `{ value, setValue, isControlled }`
 *
 * The `value` is either:
 * - The controlled value passed to the hook,
 * - Or the internal state managed internally when uncontrolled.
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
  value: ValueType | undefined;

  /**
   * Sets the value if uncontrolled. No-op in controlled mode.
   * @param nextValue - New value to assign.
   */
  setValue: (nextValue: ValueType) => void;

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
  value: ValueType | undefined,

  /**
   * Sets the value if uncontrolled. No-op in controlled mode.
   * @param nextValue - New value to assign.
   */
  setValue: (nextValue: ValueType) => void,

  /**
   * Whether the hook is operating in controlled mode.
   */
  isControlled: boolean,
];
