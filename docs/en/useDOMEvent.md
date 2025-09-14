# `useDOMEvent`

## Description

`useDOMEvent` is a hook for **type-safe** subscription to DOM events on an element. It supports four usage forms: with an existing `ref` and a single event, with auto-created `ref` and a single event, with a `ref` and an **event map**, and with an event map and auto-created `ref`.

The hook automatically uses the **latest handler** without re-attaching listeners unnecessarily, and it cleans them up on unmount. Default listener options are: `capture: false`, `once: false`, `passive: false`.

---

## Signature

```ts
// 1) ref + single event
function useDOMEvent<El extends Element | null, T extends UseDOMEventType>(
  ref: React.RefObject<El | null>,
  eventType: T,
  eventHandler: UseDOMEventHandler<T>,
  eventOptions?: AddEventListenerOptions,
): void;

// 2) single event + auto ref
function useDOMEvent<El extends Element | null, T extends UseDOMEventType>(
  eventType: T,
  eventHandler: UseDOMEventHandler<T>,
  eventOptions?: AddEventListenerOptions,
): [React.RefObject<El | null>];

// 3) ref + event map
function useDOMEvent<El extends Element | null>(
  ref: React.RefObject<El | null>,
  eventsMap: UseDOMEventMap,
): void;

// 4) event map + auto ref
function useDOMEvent<El extends Element | null>(
  eventsMap: UseDOMEventMap,
): [React.RefObject<El | null>];
```

- **Parameters**
   - `ref` — a React ref pointing to the DOM element where listeners should be attached.
   - `eventType` — a DOM event name (e.g., `'click'`, `'keydown'`).
   - `eventHandler` — event handler; the event type is inferred automatically.
   - `eventOptions?` — listener options (`capture`, `once`, `passive`).
   - `eventsMap` — object of the form `{ type: handler | [handler, options] }`.

- **Returns**
   - In forms with auto-ref — a tuple `[ref]`.
   - In forms with an explicit `ref` — `void`.

---

## Examples

### 1) Existing `ref` + single event

```tsx
import { useRef } from 'react';
import { useDOMEvent } from '@webeach/react-hooks/useDOMEvent';

export function InputOnEnter() {
  const inputRef = useRef<HTMLInputElement>(null);

  useDOMEvent(inputRef, 'keydown', (event) => {
    if (event.key === 'Enter') {
      console.log('Submit!');
      event.preventDefault();
    }
  });

  return <input ref={inputRef} />;
}
```

### 2) Auto-created `ref` + listener options

```tsx
import { useDOMEvent } from '@webeach/react-hooks/useDOMEvent';

export function ScrollLogger() {
  const [ref] = useDOMEvent<HTMLDivElement>('scroll', (event) => {
    console.log('scrollTop =', (event.target as HTMLDivElement).scrollTop);
  }, { passive: true });

  return <div ref={ref} style={{ overflow: 'auto', maxHeight: 200 }}>…content…</div>;
}
```

### 3) Event map with multiple types and options

```tsx
import { useRef } from 'react';
import { useDOMEvent } from '@webeach/react-hooks/useDOMEvent';

export function HoverAndClick() {
  const ref = useRef<HTMLButtonElement>(null);

  useDOMEvent(ref, {
    mouseenter: (event) => console.log('x', event.clientX), // MouseEvent
    click: [(event) => console.log('clicked', event.button), { capture: false }],
  });

  return <button ref={ref}>Hover or Click</button>;
}
```

---

## Behavior

1. **Layout phase subscription**
   - Event listeners are attached/detached during the layout effect phase to avoid missing early events before paint.

2. **Latest handler reference**
   - Handlers are read from a live ref; you can update functions between renders without re-attaching listeners.

3. **When listeners re-attach**
   - Listeners are re-attached only if the **element reference** (`ref.current`) or the **structure** of the event map/options changes. Changing the handler function itself does **not** trigger re-attachment.

4. **Default options**
   - If not specified, listener options default to `{ capture: false, once: false, passive: false }`.

5. **Auto cleanup**
   - All listeners are automatically removed when the component unmounts.

6. **SSR safe**
   - No direct access to `window`/`document` during render. Subscriptions happen only inside effects.

---

## When to use

- Subscribing to **native DOM events** on a ref element.
- When handlers change often but you don’t want to re-attach listeners each render.
- When attaching multiple events via a single map is more convenient.

## When **not** to use

- If React’s built-in props (`onClick`, `onChange`, etc.) are sufficient.
- For global events on `window` or `document`, consider using specialized hooks like `useWindowEvent` instead.

---

## Common mistakes

1. **Passing a value instead of a ref**
   - You must provide a `ref` or use the returned `[ref]` form. Forgetting to attach the `ref` means listeners won’t work.

2. **Mixing synthetic and native events**
   - React props like `onClick` receive **synthetic events**, but `useDOMEvent` handlers receive **native events**.

3. **Unstable event map**
   - Creating a new object literal for `eventsMap` every render will force re-attaching listeners. Use `useMemo` if stability is needed.

4. **Using unsupported options**
   - The `signal` option is not supported. Use `AbortController` manually for cancellation.

---

## Typing

**Exported types**

- `UseDOMEventHandler<EventType>`
   - `(event: GlobalEventHandlersEventMap[EventType]) => void` — type-safe event handler, inferred from the event type.

- `UseDOMEventType`
   - Union of all standard `GlobalEventHandlersEventMap` event names (e.g., `'click'`, `'keydown'`).

- `UseDOMEventMap`
   - Mapping `{ [type]: handler | [handler, options] }` for multiple events.

- `UseDOMEventOptions`
   - Listener options without `signal`: `{ capture?: boolean; once?: boolean; passive?: boolean }`.

---

## See also

- [useOutsideEvent](useOutsideEvent.md)
- [useWindowEvent](useWindowEvent.md)
