import { useCallback, useEffect, useRef, useState } from 'react';

import { useDemandStructure } from '../useDemandStructure';
import { useLiveRef } from '../useLiveRef';

import { UseControlledReturn } from './types';

/**
 * Manages a value that can be either controlled or uncontrolled.
 *
 * - If `value` is provided, the hook operates in controlled mode and mirrors it.
 * - Otherwise, it manages internal state using `defaultValue`.
 *
 * The result can be accessed both as a tuple and as an object:
 * - Tuple: `[value, setValue, isControlled]`
 * - Object: `{ value, setValue, isControlled }`
 *
 * @template ValueType - Type of the value being controlled.
 * @param defaultValue - Initial value used in uncontrolled mode.
 *                       Can be a plain value or a lazy initializer function.
 * @param value - Controlled value. If defined, takes precedence over internal state.
 * @returns A hybrid structure exposing:
 * - `value`: The current value (controlled or internal).
 * - `setValue(nextValue)`: Updates the value if uncontrolled.
 * - `isControlled`: Whether the hook is currently in controlled mode.
 *
 * @example
 * ```tsx
 * // Controlled:
 * const { value, setValue, isControlled } = useControlled(undefined, props.value);
 *
 * // Uncontrolled:
 * const [value, setValue, isControlled] = useControlled(0, undefined);
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useControlled.md
 */
export function useControlled<ValueType>(
  defaultValue: ValueType | (() => ValueType) | undefined,
  value: ValueType | undefined,
): UseControlledReturn<ValueType> {
  // Internal state used when the component is uncontrolled
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  // Determine if the component is controlled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  // Refs to track controlled mode and last controlled value
  const isControlledRef = useLiveRef(isControlled);
  const isMountedRef = useRef(false);
  const lastControlledValueRef = useRef<ValueType>(undefined);

  /**
   * Setter function that only updates internal state in uncontrolled mode.
   */
  const setValue = useCallback((nextValue: ValueType) => {
    if (!isControlledRef.current) {
      setUncontrolledValue(nextValue);
    }
  }, []);

  useEffect(() => {
    // If component switches from controlled to uncontrolled after mount,
    // fallback to the last known controlled value.
    if (!isControlled && uncontrolledValue && isMountedRef.current) {
      setUncontrolledValue(lastControlledValueRef.current);
    }

    isMountedRef.current = true;
  }, [isControlled]);

  useEffect(() => {
    // Store last known controlled value to restore if needed
    lastControlledValueRef.current = value;
  }, [value]);

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
