import { RefObject } from 'react';

import { shallowCompareArrays } from '../../functions/shallowCompareArrays';

import { DEFAULT_EVENT_OPTIONS } from './constants';
import { EventArgs, UseDOMEventMap, UseDOMEventType } from './types';

/**
 * Determines whether the first argument is a `ref`.
 *
 * Used to support both:
 * - `useDOMEvent(ref, ...)`
 * - `useDOMEvent(...)` (without a ref, returns internal one)
 *
 * @param args - Arguments passed to `useDOMEvent`
 * @returns `true` if the first argument is a React ref
 */
export function argsHasRef(
  args: [RefObject<unknown>, ...EventArgs] | EventArgs,
): args is [RefObject<unknown>, ...EventArgs] {
  const maybeRef = args[0];

  return (
    args.length > 1 && typeof maybeRef === 'object' && 'current' in maybeRef
  );
}

/**
 * Compares two event maps by structure (keys and listener options only).
 *
 * Ignores actual handler functions and compares:
 * - keys (event types)
 * - shape: is it handler or [handler, options]
 * - options: `capture`, `once`, `passive`
 *
 * @param prevEventMap - The previous event map
 * @param nextEventMap - The next event map
 * @returns `true` if structure and options are equal
 */
export function compareEventMapStructure(
  prevEventMap: UseDOMEventMap,
  nextEventMap: UseDOMEventMap,
) {
  const prevEventMapKeys = Object.keys(prevEventMap) as UseDOMEventType[];
  const nextEventMapKeys = Object.keys(nextEventMap) as UseDOMEventType[];

  if (!shallowCompareArrays(prevEventMapKeys, nextEventMapKeys)) {
    return false;
  }

  return nextEventMapKeys.every((key) => {
    const prevEntry = prevEventMap[key]!;
    const nextEntry = nextEventMap[key]!;

    const prevEntryIsArray = Array.isArray(prevEntry);
    const nextEntryIsArray = Array.isArray(nextEntry);

    if (prevEntryIsArray && nextEntryIsArray) {
      return compareEventOptions(prevEntry[1], nextEntry[1]);
    }

    return prevEntryIsArray === nextEntryIsArray;
  });
}

/**
 * Compares both the DOM element and the event map structure.
 *
 * Used for memoization inside `useDOMEvent` to avoid unnecessary listener changes.
 *
 * @param prev - Tuple of previous element and event map
 * @param next - Tuple of next element and event map
 * @returns `true` if element and event structure are equal
 */
export function compareEventMapStructureAndElement(
  [prevElement, prevEventMap]: [Element | null, UseDOMEventMap],
  [nextElement, nextEventMap]: [Element | null, UseDOMEventMap],
) {
  return (
    prevElement === nextElement &&
    compareEventMapStructure(prevEventMap, nextEventMap)
  );
}

/**
 * Compares two event listener option objects.
 *
 * Ignores `signal`. Only compares:
 * - `capture`
 * - `once`
 * - `passive`
 *
 * @param prevEventOptions - Previous options (defaulted if missing)
 * @param nextEventOptions - Next options (defaulted if missing)
 * @returns `true` if all compared options are equal
 */
export function compareEventOptions(
  prevEventOptions = DEFAULT_EVENT_OPTIONS,
  nextEventOptions = DEFAULT_EVENT_OPTIONS,
) {
  return (
    Boolean(prevEventOptions.capture) === Boolean(nextEventOptions.capture) &&
    Boolean(prevEventOptions.once) === Boolean(nextEventOptions.once) &&
    Boolean(prevEventOptions.passive) === Boolean(nextEventOptions.passive)
  );
}

/**
 * Checks whether `useDOMEvent` received a single-argument map form.
 *
 * @param eventArgs - Arguments passed to `useDOMEvent`
 * @returns `true` if it's the map form: `useDOMEvent({ click: ... })`
 */
export function eventArgsIsMap(
  eventArgs: EventArgs,
): eventArgs is readonly [UseDOMEventMap] {
  return eventArgs.length === 1;
}
