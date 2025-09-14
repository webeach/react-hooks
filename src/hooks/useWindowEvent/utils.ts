import { shallowCompareArrays } from '../../functions/shallowCompareArrays';

import { DEFAULT_EVENT_OPTIONS } from './constants';
import { EventArgs, UseWindowEventMap, UseWindowEventType } from './types';

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
  prevEventMap: UseWindowEventMap,
  nextEventMap: UseWindowEventMap,
) {
  const prevEventMapKeys = Object.keys(prevEventMap) as UseWindowEventType[];
  const nextEventMapKeys = Object.keys(nextEventMap) as UseWindowEventType[];

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
 * Checks whether `useWindowEvent` received a single-argument map form.
 *
 * @param eventArgs - Arguments passed to `useWindowEvent`
 * @returns `true` if it's the map form: `useWindowEvent({ click: ... })`
 */
export function eventArgsIsMap(
  eventArgs: EventArgs,
): eventArgs is readonly [UseWindowEventMap] {
  return eventArgs.length === 1;
}
