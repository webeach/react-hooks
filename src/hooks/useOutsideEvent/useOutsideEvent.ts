import { RefObject } from 'react';

import { useLiveRef } from '../useLiveRef';
import { useRefEffect } from '../useRefEffect';

import { UseOutsideEventHandler, UseOutsideEventType } from './types';

/**
 * Subscribes to a specific DOM event on the `document` and calls the handler
 * **only when the event originates from outside the referenced element**.
 *
 * Useful for detecting outside clicks, touches, or other interactions —
 * for example, to close modals or dropdowns when clicking outside.
 *
 * @template ElementType - The type of the target HTML element (e.g., `HTMLDivElement`).
 * @template EventType - The DOM event type (e.g., `'click'`, `'mousedown'`, `'touchstart'`).
 *
 * @param ref - A React ref pointing to the DOM element to detect outside events for.
 * @param eventType - A valid event type from `UseOutsideEventType` to listen for on `document`.
 * @param handler - A callback that runs when the event occurs **outside** the referenced element.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useOutsideEvent(ref, 'click', (event) => {
 *   console.log('Clicked outside the box');
 * });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useOutsideEvent.md
 */
export function useOutsideEvent<
  ElementType extends HTMLElement,
  EventType extends UseOutsideEventType,
>(
  ref: RefObject<ElementType | null>,
  eventType: EventType,
  handler: UseOutsideEventHandler<EventType>,
) {
  const handlerLiveRef = useLiveRef(handler);

  useRefEffect(ref, () => {
    const element = ref.current!;

    const eventHandler: UseOutsideEventHandler<EventType> = (event) => {
      if (!element.contains(event.target as Element)) {
        handlerLiveRef.current(event);
      }
    };

    document.addEventListener(eventType, eventHandler);

    return () => {
      document.removeEventListener(eventType, eventHandler);
    };
  }, [eventType]);
}
