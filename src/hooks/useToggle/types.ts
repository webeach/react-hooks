/**
 * Function returned by `useToggle` to update the boolean state.
 *
 * - If called with no arguments, it toggles the current value.
 * - If called with `true` or `false`, it sets the value explicitly.
 *
 * @param force - Optional boolean to force the value.
 */
export type UseToggleFunction = (force?: boolean) => void;

/**
 * Combined return type of `useToggle`, supporting both tuple and object access.
 *
 * You can use it either as:
 * - Tuple: `[value, toggle]`
 * - Object: `{ value, toggle }`
 */
export type UseToggleReturn = UseToggleReturnTuple & UseToggleReturnObject;

/**
 * Object-style return from `useToggle`.
 */
export type UseToggleReturnObject = {
  value: boolean;
  toggle: UseToggleFunction;
};

/**
 * Tuple-style return from `useToggle`.
 */
export type UseToggleReturnTuple = readonly [
  value: boolean,
  toggle: UseToggleFunction,
];
