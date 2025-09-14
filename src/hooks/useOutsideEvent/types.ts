/**
 * A callback function triggered when a specific DOM event occurs.
 * Used in `useOutsideEvent` to handle events of the specified type.
 *
 * @template EventType - The name of the DOM event (e.g., 'click', 'mousedown').
 */
export type UseOutsideEventHandler<
  EventType extends UseOutsideEventType = UseOutsideEventType,
> = (event: GlobalEventHandlersEventMap[EventType]) => void;

/**
 * A union of all standard DOM event types supported by `GlobalEventHandlersEventMap`.
 * Used to constrain which events can be listened for in `useOutsideEvent`.
 */
export type UseOutsideEventType = keyof GlobalEventHandlersEventMap;
