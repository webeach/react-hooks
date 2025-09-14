import { useCallback, useState } from 'react';

import { useDemandStructure } from '../useDemandStructure';

import { UseToggleFunction, UseToggleReturn } from './types';

/**
 * Manages a boolean state with a toggle function.
 *
 * Returns a hybrid structure that supports both tuple and object access:
 * - Tuple: `[value, toggle]`
 * - Object: `{ value, toggle }`
 *
 * The `toggle` function can:
 * - Flip the current value if called with no arguments.
 * - Explicitly set the value if passed `true` or `false`.
 *
 * @param initialValue - Optional initial value (default is `false`)
 * @returns An object exposing:
 * - `value`: The current boolean value.
 * - `toggle(force?)`: Toggles the value or sets it explicitly if `force` is provided.
 *
 * @example
 * const [on, toggle] = useToggle();
 * toggle();      // false → true
 * toggle();      // true → false
 * toggle(true);  // force to true
 * toggle(false); // force to false
 *
 * // or:
 * const state = useToggle(true);
 * state.toggle();      // true → false
 * console.log(state.value); // false
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useToggle.md
 */
export function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [currentValue, setCurrentValue] = useState(initialValue);

  const toggle = useCallback<UseToggleFunction>((force) => {
    if (force !== undefined) {
      setCurrentValue(force);
      return;
    }

    setCurrentValue((prevValue) => !prevValue);
  }, []);

  return useDemandStructure([
    {
      alias: 'value',
      accessor: () => currentValue,
    },
    {
      alias: 'toggle',
      accessor: () => toggle,
    },
  ]);
}
