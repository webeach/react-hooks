import { MutableRefObject, useRef } from 'react';

/**
 * A hook that always returns a mutable ref object containing the latest value.
 *
 * Useful when you want to access the most recent value inside callbacks or effects
 * without re-subscribing to changes.
 *
 * @template Value Type of the value being tracked.
 * @param {T} value - The current value to track.
 * @returns {React.RefObject<Value>} A ref object whose `.current` is always the latest value.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useLiveRef.md
 */
export function useLiveRef<Value>(value: Value): MutableRefObject<Value> {
  const ref = useRef<Value>(value);

  // Update ref on every render to keep the latest value
  ref.current = value;

  return ref;
}
