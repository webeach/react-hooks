import { useState } from 'react';

import { useThrottleCallback } from '../useThrottleCallback';

import { UseThrottleStateReturn } from './types';

/**
 * Create state with a **throttled setter**.
 *
 * The returned setter limits how often state can change: the **first** call after
 * a quiet period updates state **immediately** (leading), and subsequent calls
 * **within** the window of `delayMs` are **coalesced** into **one** update at the
 * end of the window with the **latest** value (trailing).
 *
 * Characteristics:
 * - **Stable setter identity** — safe to put in deps and event subscriptions.
 * - **Leading + trailing** semantics — quick first response, then one final update with last value.
 * - **Unmount‑safe** — any pending trailing update is cleared on unmount (via `useThrottleCallback`).
 * - **Changing `delayMs`** — does not affect an already scheduled trailing update; the new delay applies to the **next** setter call.
 *
 * @example
 * // Minimal form with implicit undefined initial state
 * const [value, setValueThrottled] = useThrottleState<string>(300);
 *
 * @template State Type of the state value.
 * @param delayMs Throttle window in **milliseconds**.
 * @returns A tuple: `[state, setThrottleState]`.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useThrottleState.md
 */
function useThrottleState<State = undefined>(
  delayMs: number,
): UseThrottleStateReturn<State | undefined>;

/**
 * Create state with a **throttled setter**, providing an initial value.
 *
 * Use this overload when you have a known initial state. Each call to the
 * setter within the same throttle window collapses into a single update with
 * the **latest** value. The first call after a quiet period updates state
 * immediately.
 *
 * Functional updates are supported: the **last** function passed wins and will
 * be applied once when the window ends (if it was scheduled as trailing),
 * while the leading call applies its function immediately.
 *
 * @example
 * const [query, setQueryThrottled] = useThrottleState('', 250);
 * onChange={(e) => setQueryThrottled(e.currentTarget.value)}
 *
 * @template State Type of the state value.
 * @param initialState Initial state value (or lazy initializer).
 * @param delayMs Throttle window in **milliseconds**.
 * @returns A tuple: `[state, setThrottleState]`.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useThrottleState.md
 */
function useThrottleState<State>(
  initialState: State | (() => State),
  delayMs: number,
): UseThrottleStateReturn<State>;

function useThrottleState<State>(
  ...args: [number] | [State, number]
): UseThrottleStateReturn<State> {
  // Normalize overloads: either [state, delay] or [delay]
  const [initialState, delayMs] = (
    args.length > 1 ? args : [undefined, args[0]]
  ) as [State, number];

  const [state, setState] = useState(initialState);

  // Throttled setter: immediate update on first call after quiet period (leading)
  // and one coalesced update at the end of the window with the latest value (trailing)
  const setThrottleState = useThrottleCallback(setState, delayMs);

  return [state, setThrottleState] as const;
}

export { useThrottleState };
