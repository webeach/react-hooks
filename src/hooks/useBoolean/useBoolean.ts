import { useCallback, useState } from 'react';

import { useDemandStructure } from '../useDemandStructure';

import { UseBooleanReturn } from './types';

/**
 * Manages a boolean state with convenient `setTrue` and `setFalse` callbacks.
 *
 * Returns a hybrid structure that supports both tuple and object destructuring:
 * - Tuple: `[value, setTrue, setFalse]`
 * - Object: `{ value, setTrue, setFalse }`
 *
 * @param initialValue - Optional initial value, defaults to `false`.
 * @returns An object exposing:
 * - `value`: Current boolean state.
 * - `setTrue()`: Function to set the state to `true`.
 * - `setFalse()`: Function to set the state to `false`.
 *
 * @example
 * ```tsx
 * const [isOpen, open, close] = useBoolean();
 * open();  // sets to true
 * close(); // sets to false
 *
 * // or use named access:
 * const state = useBoolean();
 * state.setTrue();
 * console.log(state.value);
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useBoolean.md
 */
export function useBoolean(initialValue: boolean = false): UseBooleanReturn {
  const [currentValue, setCurrentValue] = useState(initialValue);

  const setFalse = useCallback(() => setCurrentValue(false), []);
  const setTrue = useCallback(() => setCurrentValue(true), []);

  return useDemandStructure([
    {
      alias: 'value',
      accessor: () => currentValue,
    },
    {
      alias: 'setTrue',
      accessor: () => setTrue,
    },
    {
      alias: 'setFalse',
      accessor: () => setFalse,
    },
  ]);
}
