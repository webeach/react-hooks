/**
 * Possible arguments for `useWindowEvent`.
 *
 * Accepts either:
 * - a tuple of `[eventType, handler, options?]`
 * - a single object mapping event types to handlers or `[handler, options]`
 */
export type EventArgs =
  | readonly [
      eventType: UseWindowEventType,
      eventHandler: UseWindowEventHandler,
      eventOptions?: UseWindowEventOptions,
    ]
  | readonly [UseWindowEventMap];

/**
 * A type-safe `window` event handler.
 *
 * Automatically infers the event object type based on the event name.
 *
 * @template EventType - The event type from `WindowEventMap`, e.g., `'scroll'`, `'resize'`
 */
export type UseWindowEventHandler<
  EventType extends UseWindowEventType = UseWindowEventType,
> = (event: UseWindowEventInstance<EventType>) => void;

/**
 * The event object corresponding to a `window` event type.
 *
 * For example:
 * - `'scroll'` → `Event`
 * - `'keydown'` → `KeyboardEvent`
 */
export type UseWindowEventInstance<
  EventType extends UseWindowEventType = UseWindowEventType,
> = WindowEventMap[EventType];

/**
 * A map of `window` event types to their handlers.
 *
 * Each value can be:
 * - a direct event handler function
 * - or a tuple `[handler, options]` to include listener options
 */
export type UseWindowEventMap = {
  [EventType in UseWindowEventType]?:
    | UseWindowEventHandler<EventType>
    | [
        eventHandler: UseWindowEventHandler<EventType>,
        eventOptions?: UseWindowEventOptions,
      ];
};

/**
 * Options for `window.addEventListener` (without `signal`).
 *
 * You can specify `capture`, `passive`, or `once`.
 */
export type UseWindowEventOptions = Omit<AddEventListenerOptions, 'signal'>;

/**
 * All supported event names from the global `window` object.
 *
 * For example: `'resize'`, `'scroll'`, `'keydown'`, `'beforeunload'`, etc.
 */
export type UseWindowEventType = keyof WindowEventMap;
