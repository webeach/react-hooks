import { useState } from 'react';

import { useDebounceCallback } from '../useDebounceCallback';

import { UseDebounceStateReturn } from './types';

/**
 * Create state with a **debounced setter**.
 *
 * The returned setter postpones updating the state until `delayMs` milliseconds
 * have elapsed **since the last call**. Rapid calls collapse into a single
 * update with the **latest** value (trailing debounce).
 *
 * Characteristics:
 * - **Stable setter identity** — safe to use in deps and subscriptions.
 * - **Trailing only** — the update happens after the quiet period.
 * - **Unmount‑safe** — pending update is cleared on unmount (via `useDebounceCallback`).
 * - **Changing `delayMs`** — does not affect an already scheduled update; new
 *   delay applies to the **next** setter call.
 *
 * @example
 * // Minimal form with implicit undefined initial state
 * const [value, setValueDebounced] = useDebounceState<string>(300);
 *
 * @example
 * // With explicit initial state
 * const [query, setQueryDebounced] = useDebounceState('', 300);
 *
 * // Somewhere in an input handler
 * onChange={(event) => setQueryDebounced(event.currentTarget.value)}
 *
 * @template State Type of the state value.
 * @param delayMs Debounce delay in **milliseconds**.
 * @returns A tuple: `[state, setDebounceState]`.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDebounceState.md
 */
function useDebounceState<State = undefined>(
  delayMs: number,
): UseDebounceStateReturn<State | undefined>;

/**
 * Create state with a **debounced setter**, providing an initial value.
 *
 * Use this overload when you have a known initial state. The semantics match
 * the short form: each call to the setter resets the timer; the state is
 * updated once after `delayMs` ms with the **last** provided value.
 *
 * @example
 * const [slider, setSliderDebounced] = useDebounceState(50, 200);
 * onChange={(next) => setSliderDebounced(next)};
 *
 * @template State Type of the state value.
 * @param initialState Initial state value (or lazy initializer).
 * @param delayMs Debounce delay in **milliseconds**.
 * @returns A tuple: `[state, setDebounceState]`.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDebounceState.md
 */
function useDebounceState<State>(
  initialState: State | (() => State),
  delayMs: number,
): UseDebounceStateReturn<State>;

function useDebounceState<State>(
  ...args: [number] | [State, number]
): UseDebounceStateReturn<State> {
  // Normalize overloads: either [state, delay] or [delay]
  const [initialState, delayMs] = (
    args.length > 1 ? args : [undefined, args[0]]
  ) as [State, number];

  const [state, setState] = useState(initialState);

  // Debounced setter that collapses rapid calls into one trailing update
  const setDebounceState = useDebounceCallback(setState, delayMs);

  return [state, setDebounceState] as const;
}

export { useDebounceState };
