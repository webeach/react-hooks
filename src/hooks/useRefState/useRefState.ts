import { useCallback, useMemo, useRef, useState } from 'react';

import { isFunction } from '../../functions/isFunction';
import { useLiveRef } from '../useLiveRef';

import { UseRefStateDispatch, UseRefStateReturn } from './types';

/**
 * A React hook that provides mutable state using a ref,
 * with optional re-rendering support.
 *
 * This hook is useful when you want to store a mutable value that can be updated
 * without causing re-renders, but also want the ability to trigger re-renders
 * on demand when needed.
 *
 * ---
 *
 * Overload 1: No initial value
 *
 * @returns A tuple containing:
 * - a mutable ref object (`ref.current`)
 * - a setter function to update the value
 * - an object with `disableUpdate` / `enableUpdate` functions to control re-renders
 *
 * @example
 * ```tsx
 * const [ref, setRef, { disableUpdate, enableUpdate }] = useRefState<number>();
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useRefState.md
 */
function useRefState<ValueType = undefined>(): UseRefStateReturn<
  ValueType | undefined
>;

/**
 * Overload 2: With initial value and optional update control
 *
 * @param initialValue - Initial value or initializer function.
 * @param initialUpdatable - Whether changes should trigger re-renders initially (default: false).
 *
 * @returns A tuple containing:
 * - a mutable ref object (`ref.current`)
 * - a setter function to update the value
 * - an object with `disableUpdate` / `enableUpdate` functions to control re-renders
 *
 * @example
 * ```tsx
 * const [ref, setRef, { disableUpdate, enableUpdate }] = useRefState(0);
 * ```
 *
 * @example
 * ```tsx
 * const [ref, setRef] = useRefState(() => expensiveInit(), false);
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useRefState.md
 */
function useRefState<ValueType>(
  initialValue: ValueType | (() => ValueType),
  initialUpdatable?: boolean,
): UseRefStateReturn<ValueType>;

function useRefState<ValueType>(
  initialValue?: ValueType | (() => ValueType),
  initialUpdatable = false,
): UseRefStateReturn<ValueType | undefined> {
  const [currentState, setCurrentState] = useState(() => {
    return isFunction(initialValue) ? initialValue() : initialValue;
  });

  const currentStateRef = useRef(currentState);
  const updatableRef = useRef(initialUpdatable);

  const setRefState = useCallback(
    (
      value: ValueType | UseRefStateDispatch<ValueType | undefined> | undefined,
    ) => {
      const updatable = updatableRef.current;

      if (!isFunction(value)) {
        currentStateRef.current = value;

        if (updatable) {
          setCurrentState(value);
        }

        return;
      }

      if (updatable) {
        setCurrentState(() => {
          const nextState = value(currentStateRef.current);
          currentStateRef.current = nextState;
          return nextState;
        });

        return;
      }

      currentStateRef.current = value(currentStateRef.current);
    },
    [],
  );

  const syncStateRef = useLiveRef(() => {
    if (currentState !== currentStateRef.current) {
      setCurrentState(currentStateRef.current);
    }
  });

  const [disableUpdate, enableUpdate] = useMemo(
    () =>
      [
        () => {
          updatableRef.current = false;
        },
        (forceUpdate?: boolean) => {
          updatableRef.current = true;

          if (forceUpdate) {
            syncStateRef.current();
          }
        },
      ] as const,
    [],
  );

  return [currentStateRef, setRefState, { disableUpdate, enableUpdate }];
}

export { useRefState };
