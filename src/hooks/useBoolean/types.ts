/**
 * Combined return type of `useBoolean`, supporting both tuple and object access.
 *
 * You can use it either as:
 * - Tuple: `[value, setTrue, setFalse]`
 * - Object: `{ value, setTrue, setFalse }`
 */
export type UseBooleanReturn = UseBooleanReturnTuple & UseBooleanReturnObject;

/**
 * Object-style return from `useBoolean`.
 */
export type UseBooleanReturnObject = {
  /**
   * The current boolean value.
   */
  value: boolean;

  /**
   * Sets the value to `true`.
   */
  setTrue: () => void;

  /**
   * Sets the value to `false`.
   */
  setFalse: () => void;
};

/**
 * Tuple-style return from `useBoolean`.
 */
export type UseBooleanReturnTuple = readonly [
  /**
   * The current boolean value.
   */
  value: boolean,

  /**
   * Sets the value to `true`.
   */
  setTrue: () => void,

  /**
   * Sets the value to `false`.
   */
  setFalse: () => void,
];
