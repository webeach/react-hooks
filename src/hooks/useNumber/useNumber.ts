import { useCallback, useState } from 'react';

import { useDemandStructure } from '../useDemandStructure'; // или где у тебя интерфейс лежит

import type { UseNumberReturn } from './types';

/**
 * Manages a numeric state with convenient utility methods.
 *
 * Returns a hybrid structure that supports both tuple and object access:
 * - Tuple: `[value, setValue, increment, decrement, reset]`
 * - Object: `{ value, setValue, increment, decrement, reset }`
 *
 * @param initialValue - Initial number value (default is `0`).
 * @returns An object exposing:
 * - `value`: Current numeric state.
 * - `setValue(newValue)`: Replaces the current value.
 * - `increment(step?)`: Increases value by `step` (default `1`).
 * - `decrement(step?)`: Decreases value by `step` (default `1`).
 * - `reset()`: Resets value back to the initial value.
 *
 * @example
 * const [count, setCount, inc, dec, reset] = useNumber(5);
 * inc();       // count = 6
 * dec(2);      // count = 4
 * reset();     // count = 5
 *
 * // or use object access:
 * const counter = useNumber();
 * counter.increment();
 * console.log(counter.value); // 1
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useNumber.md
 */
export function useNumber(initialValue: number = 0): UseNumberReturn {
  const [value, setValue] = useState(initialValue);

  /**
   * Increments the current value by the given step.
   * Defaults to 1 if no step is provided.
   */
  const increment = useCallback((step: number = 1) => {
    setValue((prevValue) => prevValue + step);
  }, []);

  /**
   * Decrements the current value by the given step.
   * Internally implemented as negative increment.
   */
  const decrement = useCallback(
    (step: number = 1) => {
      increment(-step);
    },
    [increment],
  );

  /**
   * Resets the value back to the initial value.
   */
  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  /**
   * Sets the value to a specific number.
   */
  const set = useCallback((newValue: number) => {
    setValue(newValue);
  }, []);

  return useDemandStructure([
    {
      alias: 'value',
      accessor: () => value,
    },
    {
      alias: 'setValue',
      accessor: () => set,
    },
    {
      alias: 'increment',
      accessor: () => increment,
    },
    {
      alias: 'decrement',
      accessor: () => decrement,
    },
    {
      alias: 'reset',
      accessor: () => reset,
    },
  ]);
}
