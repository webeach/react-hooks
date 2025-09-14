import { useEffect, useState } from 'react';

import {
  $DemandStructureUsingSymbol,
  useDemandStructure,
} from '../useDemandStructure';
import { useLiveRef } from '../useLiveRef';

import { UseTimeoutCallback, UseTimeoutReturn } from './types';

/**
 * Starts a timeout and returns its current completion state.
 *
 * You can access the result as a tuple (`[isDone]`) or an object (`{ isDone }`).
 *
 * @param ms - Timeout duration in milliseconds.
 * @returns An object containing `isDone`, which becomes `true` after the timeout completes.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useTimeout.md
 */
function useTimeout(ms: number): UseTimeoutReturn;

/**
 * Starts a timeout, triggers the provided callback after completion,
 * and returns the current completion state.
 *
 * You can access the result as a tuple (`[isDone]`) or an object (`{ isDone }`).
 *
 * @param callback - Function called after the timeout. Receives the actual elapsed time in milliseconds.
 * @param ms - Timeout duration in milliseconds.
 * @returns An object containing `isDone`, which becomes `true` after the timeout completes.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useTimeout.md
 */
function useTimeout(callback: UseTimeoutCallback, ms: number): UseTimeoutReturn;

function useTimeout(
  ...args: [ms: number] | [callback: UseTimeoutCallback, ms: number]
) {
  // Normalize arguments: support both (ms) and (callback, ms)
  const [callback, ms] = args.length === 1 ? [null, args[0]] : args;

  const [isDone, setIsDone] = useState(false);

  // Keep a reference to the latest version of the callback
  const callbackLiveRef = useLiveRef(callback);

  // Create a hybrid structure exposing the current state (`[isDone]` and `.isDone`)
  const resultState = useDemandStructure([
    {
      alias: 'isDone',
      accessor: () => isDone,
    },
  ]);

  useEffect(() => {
    if (isDone) {
      return;
    }

    const startTime = performance.now();

    const timeoutId = window.setTimeout(() => {
      // Only update state if the value was actually used
      if (resultState[$DemandStructureUsingSymbol].isDone) {
        setIsDone(true);
      }

      if (callbackLiveRef.current) {
        const actualTime = performance.now() - startTime;
        callbackLiveRef.current(actualTime);
      }
    }, ms);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [ms]);

  return resultState;
}

export { useTimeout };
