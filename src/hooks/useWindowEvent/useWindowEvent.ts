import { RefObject } from 'react';

import { useLayoutEffectCompare } from '../useLayoutEffectCompare';
import { useLiveRef } from '../useLiveRef';

import { DEFAULT_EVENT_OPTIONS } from './constants';
import {
  EventArgs,
  UseWindowEventHandler,
  UseWindowEventInstance,
  UseWindowEventMap,
  UseWindowEventOptions,
  UseWindowEventType,
} from './types';
import { compareEventMapStructure, eventArgsIsMap } from './utils';

/**
 * Adds a single event listener to the global `window` object.
 *
 * The event type and handler are strictly typed based on `UseWindowEventType`.
 *
 * @param eventType - The name of the event to listen for (e.g., `'resize'`, `'scroll'`, `'keydown'`).
 * @param eventHandler - A callback function that receives the event object.
 *                       Its parameter type is inferred based on the event type.
 * @param eventOptions - Optional listener options (e.g., `capture`, `once`, `passive`).
 *
 * @example
 * useWindowEvent('resize', (e) => {
 *   console.log(window.innerWidth);
 * });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useUnmount.md
 */
function useWindowEvent<EventType extends UseWindowEventType>(
  eventType: EventType,
  eventHandler: UseWindowEventHandler<EventType>,
  eventOptions?: AddEventListenerOptions,
): void;

/**
 * Adds multiple event listeners to the global `window` object using a map of event types to handlers.
 *
 * Each key in the map corresponds to a supported `window` event type.
 * Each value can be either:
 * - a direct handler function
 * - a tuple `[handler, options]` for additional listener configuration
 *
 * @param eventsMap - An object where keys are event types and values are handlers or `[handler, options]`.
 *
 * @example
 * useWindowEvent({
 *   scroll: (e) => console.log('Scrolling'),
 *   keydown: [(e) => console.log(e.key), { once: true }],
 * });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useUnmount.md
 */
function useWindowEvent(eventsMap: UseWindowEventMap): void;

function useWindowEvent<ElementType extends Element | null>(
  ...eventArgs: EventArgs
): [RefObject<ElementType | null>] | void {
  const eventMap: UseWindowEventMap = (() => {
    if (eventArgsIsMap(eventArgs)) {
      return eventArgs[0];
    }

    const [eventType, eventHandler, eventOptions] = eventArgs;

    return {
      [eventType]: [eventHandler, eventOptions],
    };
  })();

  const eventMapLiveRef = useLiveRef(eventMap);

  useLayoutEffectCompare(
    () => {
      const listeners: [
        string,
        UseWindowEventHandler,
        UseWindowEventOptions?,
      ][] = [];

      for (const eventType in eventMap) {
        if (Object.prototype.hasOwnProperty.call(eventMap, eventType)) {
          const handlerRaw = eventMap[eventType as UseWindowEventType];
          const eventOptions = Array.isArray(handlerRaw)
            ? handlerRaw[1] || DEFAULT_EVENT_OPTIONS
            : DEFAULT_EVENT_OPTIONS;

          const listenerHandler = (
            eventInstance: UseWindowEventInstance<any>,
          ) => {
            const handlerRawFromRef =
              eventMapLiveRef.current[eventType as UseWindowEventType];

            const handler = Array.isArray(handlerRawFromRef)
              ? handlerRawFromRef[0]
              : handlerRawFromRef;
            handler?.(eventInstance);
          };

          window.addEventListener(eventType, listenerHandler, eventOptions);
          listeners.push([eventType, listenerHandler, eventOptions]);
        }
      }

      return () => {
        for (const [eventType, listenerHandler, eventOptions] of listeners) {
          window.removeEventListener(eventType, listenerHandler, eventOptions);
        }
      };
    },
    compareEventMapStructure,
    eventMap,
  );
}

export { useWindowEvent };
