/**
 * Possible arguments for `useDOMEvent`.
 *
 * Accepts either:
 * - a tuple of `[eventType, handler, options?]`
 * - a single object mapping event types to handlers
 */
export type EventArgs =
  | readonly [
      eventType: UseDOMEventType,
      eventHandler: UseDOMEventHandler,
      eventOptions?: UseDOMEventOptions,
    ]
  | readonly [UseDOMEventMap];

/**
 * A type-safe DOM event handler.
 *
 * Automatically infers the event object type based on the event name.
 *
 * @template EventType - The DOM event type, e.g., `'click'`, `'focus'`
 */
export type UseDOMEventHandler<
  EventType extends UseDOMEventType = UseDOMEventType,
> = (event: UseDOMEventInstance<EventType>) => void;

/**
 * The event object corresponding to a DOM event type.
 *
 * For example, `'click'` → `MouseEvent`, `'keydown'` → `KeyboardEvent`.
 */
export type UseDOMEventInstance<
  EventType extends UseDOMEventType = UseDOMEventType,
> = GlobalEventHandlersEventMap[EventType];

/**
 * A map of DOM event types to their handlers.
 *
 * Each value can be either:
 * - a direct handler function
 * - a tuple `[handler, options]` to include listener options
 */
export type UseDOMEventMap = {
  [EventType in UseDOMEventType]?:
    | UseDOMEventHandler<EventType>
    | [
        eventHandler: UseDOMEventHandler<EventType>,
        eventOptions?: UseDOMEventOptions,
      ];
};

/**
 * Options for DOM event listeners.
 *
 * Based on `AddEventListenerOptions`, excluding `signal`.
 */
export type UseDOMEventOptions = Omit<AddEventListenerOptions, 'signal'>;

/**
 * All supported DOM event names, like `'click'`, `'keydown'`, etc.
 */
export type UseDOMEventType = keyof GlobalEventHandlersEventMap;
