import { RefObject, useRef } from 'react';

import { useLayoutEffectCompare } from '../useLayoutEffectCompare';
import { useLiveRef } from '../useLiveRef';

import { DEFAULT_EVENT_OPTIONS } from './constants';
import {
  EventArgs,
  UseDOMEventHandler,
  UseDOMEventInstance,
  UseDOMEventMap,
  UseDOMEventOptions,
  UseDOMEventType,
} from './types';
import {
  argsHasRef,
  compareEventMapStructureAndElement,
  eventArgsIsMap,
} from './utils';

/**
 * Adds a single DOM event listener to the given element.
 *
 * The event type and handler are strictly typed based on `UseDOMEventType`.
 *
 * @param ref - A ref to the DOM element to attach the event to.
 * @param eventType - A DOM event type (e.g., `'click'`, `'keydown'`, `'focus'`).
 * @param eventHandler - A callback function that handles the event. Its parameter is typed automatically.
 * @param eventOptions - Optional event listener options (e.g., `capture`, `once`, `passive`).
 *
 * @example
 * useDOMEvent(ref, 'click', (e) => {
 *   e.preventDefault(); // e: MouseEvent
 * });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDOMEvent.md
 */
function useDOMEvent<
  ElementType extends Element | null,
  EventType extends UseDOMEventType,
>(
  ref: RefObject<ElementType | null>,
  eventType: EventType,
  eventHandler: UseDOMEventHandler<EventType>,
  eventOptions?: AddEventListenerOptions,
): void;

/**
 * Adds a single DOM event listener and returns a `ref` to be attached to the element.
 *
 * This variant is useful when you want to avoid creating a `ref` manually.
 *
 * @param eventType - A DOM event type (e.g., `'click'`, `'keydown'`).
 * @param eventHandler - A callback function that handles the event.
 * @param eventOptions - Optional event listener options (e.g., `capture`, `once`, `passive`).
 * @returns A tuple containing the internally created `ref`.
 *
 * @example
 * const [ref] = useDOMEvent('keydown', (e) => {
 *   console.log(e.key); // e: KeyboardEvent
 * });
 *
 * return <input ref={ref} />;
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDOMEvent.md
 */
function useDOMEvent<
  ElementType extends Element | null,
  EventType extends UseDOMEventType,
>(
  eventType: EventType,
  eventHandler: UseDOMEventHandler<EventType>,
  eventOptions?: AddEventListenerOptions,
): [RefObject<ElementType | null>];

/**
 * Adds multiple DOM event listeners using a map of event types to handlers.
 *
 * Each key in the map corresponds to a DOM event type. Values can be:
 * - a handler function
 * - a tuple `[handler, options]` to include listener options
 *
 * The event object passed to each handler is strictly typed.
 *
 * @param ref - A ref to the DOM element to attach the events to.
 * @param eventsMap - An object mapping event types to handlers or handler+options.
 *
 * @example
 * useDOMEvent(ref, {
 *   click: (e) => {
 *     e.preventDefault(); // e: MouseEvent
 *   },
 *   keydown: [(e) => console.log(e.key), { once: true }],
 * });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDOMEvent.md
 */
function useDOMEvent<ElementType extends Element | null>(
  ref: RefObject<ElementType | null>,
  eventsMap: UseDOMEventMap,
): void;

/**
 * Adds multiple DOM event listeners using a map and returns a `ref`.
 *
 * Useful when you want automatic `ref` creation and multiple listeners.
 *
 * @param eventsMap - An object mapping event types to handlers or handler+options.
 * @returns A tuple containing the internally created `ref`.
 *
 * @example
 * const [ref] = useDOMEvent({
 *   focus: (e) => console.log(e.type), // e: FocusEvent
 *   mouseenter: [(e) => console.log(e.clientX), { passive: true }],
 * });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDOMEvent.md
 */
function useDOMEvent<ElementType extends Element | null>(
  eventsMap: UseDOMEventMap,
): [RefObject<ElementType | null>];

function useDOMEvent<ElementType extends Element | null>(
  ...args: [RefObject<ElementType | null>, ...EventArgs] | EventArgs
): [RefObject<ElementType | null>] | void {
  const [primaryRef, ...eventArgs] = argsHasRef(args) ? args : [null, ...args];

  const secondaryRef = useRef<ElementType>(null);

  const finalRef = primaryRef ?? secondaryRef;

  const eventMap: UseDOMEventMap = (() => {
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
      if (!finalRef.current) {
        return;
      }

      const element = finalRef.current;
      const listeners: [string, UseDOMEventHandler, UseDOMEventOptions?][] = [];

      for (const eventType in eventMap) {
        if (Object.prototype.hasOwnProperty.call(eventMap, eventType)) {
          const handlerRaw = eventMap[eventType as UseDOMEventType];
          const eventOptions = Array.isArray(handlerRaw)
            ? handlerRaw[1] || DEFAULT_EVENT_OPTIONS
            : DEFAULT_EVENT_OPTIONS;

          const listenerHandler = (eventInstance: UseDOMEventInstance<any>) => {
            const handlerRawFromRef =
              eventMapLiveRef.current[eventType as UseDOMEventType];

            const handler = Array.isArray(handlerRawFromRef)
              ? handlerRawFromRef[0]
              : handlerRawFromRef;
            handler?.(eventInstance);
          };

          element.addEventListener(eventType, listenerHandler, eventOptions);
          listeners.push([eventType, listenerHandler, eventOptions]);
        }
      }

      return () => {
        for (const [eventType, listenerHandler, eventOptions] of listeners) {
          element.removeEventListener(eventType, listenerHandler, eventOptions);
        }
      };
    },
    compareEventMapStructureAndElement,
    [finalRef.current, eventMap],
  );

  if (primaryRef === null) {
    return [secondaryRef] as const;
  }
}

export { useDOMEvent };
