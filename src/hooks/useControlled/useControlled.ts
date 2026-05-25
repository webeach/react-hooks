import { useCallback, useEffect, useRef, useState } from 'react';

import { isFunction } from '../../functions/isFunction';
import { useDemandStructure } from '../useDemandStructure';
import { useLiveRef } from '../useLiveRef';
import { UseControlledReturn } from './types';

/**
 * Manages a value that can be either controlled or uncontrolled.
 *
 * - If `value` is provided (not `undefined`), the hook operates in controlled mode and mirrors it.
 * - Otherwise, it manages internal state seeded from `defaultValue`.
 *
 * The result can be accessed both as a tuple and as an object:
 * - Tuple: `[value, setValue, isControlled]`
 * - Object: `{ value, setValue, isControlled }`
 *
 * `setValue` supports both a plain value and an updater function `(prev) => next`,
 * just like React's `useState` setter.
 *
 * `ValueType` is inferred **only** from `defaultValue`:
 * - `useControlled('default', value)` → `value: string`
 * - `useControlled<string | undefined>(undefined, value)` → `value: string | undefined`
 *
 * @template ValueType - Type of the value being controlled (derived from `defaultValue`).
 * @param defaultValue - Seed value (or lazy initializer) used while uncontrolled.
 * @param value - Optional controlled value. When `undefined`, the hook is uncontrolled.
 *
 * @example
 * ```tsx
 * // Uncontrolled with defaultValue (value is always defined):
 * const [count, setCount] = useControlled(0, props.value);
 * setCount((prev) => prev + 1);
 *
 * // Controlled-only mode (value may be undefined):
 * const { value } = useControlled<string | undefined>(undefined, props.value);
 * ```
 *
 * @see https://react-hooks.webea.ch/hooks/useControlled.html
 */
export function useControlled<ValueType>(
  defaultValue: ValueType | (() => ValueType),
  value?: NoInfer<ValueType>,
): UseControlledReturn<ValueType> {
  // Internal state used when the component is uncontrolled
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  // Determine if the component is controlled
  const isControlled = value !== undefined;
  const currentValue = (isControlled ? value : uncontrolledValue) as ValueType;

  // Live ref so the stable `setValue` always reads the latest controlled flag
  const isControlledRef = useLiveRef(isControlled);

  // Tracks the previous `isControlled` value so we can detect a controlled → uncontrolled
  // transition explicitly. StrictMode-safe: if the effect runs twice in dev mode,
  // the second run sees `prevIsControlledRef === isControlled` and does nothing.
  const prevIsControlledRef = useRef(isControlled);
  const lastControlledValueRef = useRef<ValueType | undefined>(value);

  /**
   * Setter function that only updates internal state in uncontrolled mode.
   * Supports both a plain value and an updater function `(prev) => next`.
   */
  const setValue = useCallback(
    (nextValue: ValueType | ((prev: ValueType) => ValueType)) => {
      if (!isControlledRef.current) {
        setUncontrolledValue((prev) =>
          isFunction(nextValue) ? nextValue(prev as ValueType) : nextValue,
        );
      }
    },
    [],
  );

  useEffect(() => {
    // When the component switches from controlled to uncontrolled, restore the last
    // known controlled value. Guarded by an explicit prev→next comparison so that:
    //  - first mount never triggers it,
    //  - StrictMode's double-invocation of effects can't trigger it either.
    if (
      prevIsControlledRef.current &&
      !isControlled &&
      lastControlledValueRef.current !== undefined
    ) {
      setUncontrolledValue(lastControlledValueRef.current);
    }
    prevIsControlledRef.current = isControlled;
  }, [isControlled]);

  useEffect(() => {
    // Store last known controlled value to restore if needed. Only update while
    // actually controlled so we don't overwrite it with `undefined` on transitions.
    if (isControlled) {
      lastControlledValueRef.current = value;
    }
  }, [value, isControlled]);

  return useDemandStructure([
    {
      alias: 'value',
      accessor: () => currentValue,
    },
    {
      alias: 'setValue',
      accessor: () => setValue,
    },
    {
      alias: 'isControlled',
      accessor: () => isControlled,
    },
  ]);
}
