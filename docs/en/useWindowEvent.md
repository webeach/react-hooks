# `useWindowEvent`

## Description

`useWindowEvent` is a hook for **type‑safe** subscription to native events on the global `window` object. It supports two forms: a single event and an **events map**. The hook keeps handlers **fresh** without reattaching listeners and cleans them up correctly on unmount. Default options: `capture: false`, `once: false`, `passive: false`.

---

## Signature

```ts
// 1) Single event
function useWindowEvent<T extends UseWindowEventType>(
  eventType: T,
  eventHandler: UseWindowEventHandler<T>,
  eventOptions?: AddEventListenerOptions,
): void;

// 2) Events map
function useWindowEvent(eventsMap: UseWindowEventMap): void;
```

- **Parameters**
   - `eventType` — window event name (`'resize'`, `'scroll'`, `'keydown'`, etc.).
   - `eventHandler` — listener; the event type is inferred automatically.
   - `eventOptions?` — listener options (`capture`, `once`, `passive`).
   - `eventsMap` — an object of the form `{ type: handler | [handler, options] }`.

- **Returns**
   - `void`.

---

## Examples

### 1) Log the viewport width on `resize`

```tsx
import { useState } from 'react';
import { useWindowEvent } from '@webeach/react-hooks/useWindowEvent';

export function ViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useWindowEvent('resize', () => {
    setWidth(window.innerWidth);
  });

  return <div>width: {width}px</div>;
}
```

### 2) Warn before leaving the page (`beforeunload`)

```tsx
import { useWindowEvent } from '@webeach/react-hooks/useWindowEvent';

type ConfirmLeaveProps = {
  enabled: boolean;
};

export function ConfirmLeave(props: ConfirmLeaveProps) {
  const { enabled } = props;
  
  useWindowEvent('beforeunload', (event) => {
    if (!enabled) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  });

  return null;
}
```

### 3) Events map: `scroll` (passive) + `keydown` (once)

```tsx
import { useWindowEvent } from '@webeach/react-hooks/useWindowEvent';

export function ScrollAndHotkey() {
  useWindowEvent({
    scroll: [
      () => {
        // no preventDefault; passive=true improves scroll performance
        console.debug('scrollY =', window.scrollY);
      },
      { passive: true },
    ],
    keydown: [
      (event) => {
        if (event.key === 'h') {
          console.log('hotkey!');
        }
      },
      { once: true },
    ],
  });

  return null;
}
```

---

## Behavior

1. **Layout‑phase subscription**
   - Listeners attach/detach synchronously during the layout phase to avoid missing early events before paint.

2. **Fresh handlers**
   - The hook keeps handlers in a “live” ref, so you can replace functions between renders **without** reattaching; the **latest** version will run.

3. **When reattachment happens**
   - Listeners are reattached when the **structure** of the events map or their options (`capture`/`once`/`passive`) change. Changing handler **functions** alone does not require reattachment.

4. **Default options**
   - If no options are provided, defaults are `capture: false`, `once: false`, `passive: false`.

5. **Automatic cleanup**
   - All subscriptions are removed automatically on unmount.

6. **SSR‑safe**
   - There is no `window` access during render; subscription happens only after mount.

---

## When to Use

- Global window events: `resize`, `scroll`, `keydown`, `visibilitychange`, `beforeunload`, etc.
- Scenarios where the handler changes frequently and you want to **avoid** reattaching listeners.
- When it’s convenient to describe multiple events with a single map.

---

## When **Not** to Use

- If React element handlers (`onClick`, `onChange`) are sufficient — they don’t require global listeners.
- For other event targets (`document`, media elements, `BroadcastChannel`) — use dedicated hooks/wrappers (e.g., `useDOMEvent`).

---

## Common Mistakes

1. **Missing `passive` for scroll**
   - If you don’t intend to call `preventDefault`, set `{ passive: true }` for better scroll performance.

2. **Expecting React synthetic events**
   - This hook works with **native** `window` events. Types and behavior differ from `SyntheticEvent`.

3. **Accidental option changes**
   - Toggling `capture`/`once`/`passive` forces reattachment. Make sure that’s intentional.

4. **Using `signal`**
   - The `signal` option isn’t supported; use your own cancellation if needed.

---

## Typing

**Exported types**

- `UseWindowEventHandler<EventType>`
   - `(event: UseWindowEventInstance<EventType>) => void` — type‑safe handler; the event type is inferred from the name (`'keydown'` → `KeyboardEvent`, `'resize'` → `UIEvent`/`Event`).

- `UseWindowEventInstance<EventType>`
   - The corresponding event object from `WindowEventMap[EventType]`.

- `UseWindowEventMap`
   - Mapping `{ [type]: handler | [handler, options] }` to attach several listeners in one call.

- `UseWindowEventOptions`
   - Listener options without `signal`: `{ capture?: boolean; once?: boolean; passive?: boolean }`.

- `UseWindowEventType`
   - Union of all keys of `WindowEventMap`.

---

## See Also

- [useOutsideEvent](useOutsideEvent.md)
- [useDOMEvent](useDOMEvent.md)
