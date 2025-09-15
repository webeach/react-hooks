# `useOutsideEvent`

## Description

`useOutsideEvent` is a hook that subscribes to an event **at the `document` level** and calls the handler **only if the event occurred outside** of the provided element (`ref`). Perfect for closing modals/dropdowns on outside click, handling “outside” `mousedown`/`touchstart`, etc.

---

## Signature

```ts
function useOutsideEvent<
  ElementType extends HTMLElement,
  EventType extends UseOutsideEventType,
>(
  ref: RefObject<ElementType | null>,
  eventType: EventType,
  handler: UseOutsideEventHandler<EventType>,
): void;
```

- **Parameters**
   - `ref` — a ref to the target DOM element for which you want to detect **outside** events.
   - `eventType` — a DOM event type, e.g. `'click' | 'mousedown' | 'pointerdown' | 'touchstart'`, etc.
   - `handler` — a callback fired **only when the event happened outside** of `ref.current`.

- **Returns**: `void`.

---

## Examples

### 1) Close a dropdown on outside click
```tsx
const ref = useRef<HTMLDivElement>(null);
const [open, setOpen] = useState(false);

useOutsideEvent(ref, 'click', () => setOpen(false));

return (
  <div>
    <button onClick={() => setOpen((v) => !v)}>Toggle</button>
    {open && (
      <div ref={ref} role="menu"> ... </div>
    )}
  </div>
);
```

### 2) React to “early” interactions
```tsx
// Fires at press time, before `click`
useOutsideEvent(ref, 'mousedown', onOutsidePress);
// On touch devices — similar
useOutsideEvent(ref, 'touchstart', onOutsideTouch);
```

### 3) Multiple event types
```tsx
useOutsideEvent(ref, 'pointerdown', onOutside);
useOutsideEvent(ref, 'keydown', (e) => {
  if (e.key === 'Escape') onOutside(e);
});
```

---

## Behavior

1. **What counts as “outside”**
   - An event is considered outside if `!element.contains(event.target as Element)`.
   - For Shadow DOM specifics, consider `event.composedPath()` if you need cross‑root containment checks.

2. **Subscription / cleanup**
   - Subscribes on `document` when mounted / when `ref.current` is set.
   - Cleans up on unmount and when `eventType` changes.

3. **Fresh handler**
   - The **latest** `handler` version is invoked via `useLiveRef` (no resubscribe when the handler changes).

4. **Dependencies**
   - Resubscription occurs on `eventType` change. `handler` changes do **not** trigger resubscription.

5. **SSR‑safe**
   - Side effects run only in the browser (`useEffect`/`useRefEffect` scope).

---

## When to Use

- Closing popovers/dropdowns/menus with outside interactions.
- Blocking interactions outside a specific area.
- Canceling gestures/actions when a click occurs outside the component.

## When **Not** to Use

- If the overlay/content is rendered via a **portal** that logically belongs to the widget but lives outside of the element’s DOM tree, `contains` will return `false` — the event will be treated as “outside”. In such cases, use a shared container `ref` or custom logic.
- If you need to catch events **only inside** the element — attach regular handlers to the element itself.

---

## Common Mistakes

1. **`ref.current` is `null`**
   - No subscription occurs until the element is mounted. Ensure the `ref` is attached.

2. **Unsuitable event type**
   - `click` fires later than `mousedown`/`pointerdown`. For immediate reaction, prefer a “down” event.

3. **Stopping propagation**
   - If a handler inside the element calls `event.stopPropagation()`, the event will **not** reach `document`; your outside handler won’t run.

4. **Shadow DOM assumptions**
   - `contains` across different shadow roots may not work as expected. Use `event.composedPath()` if necessary.

---

## Types

**Exported types**

- `UseOutsideEventHandler<EventType extends UseOutsideEventType = UseOutsideEventType>`
   - Callback fired when the specified DOM event occurs: `(event: GlobalEventHandlersEventMap[EventType]) => void`.

- `UseOutsideEventType`
   - A union of all standard DOM event names (`keyof GlobalEventHandlersEventMap`).
   - Restricts which events can be used with `useOutsideEvent`.

---

## See also

- [useDOMEvent](useDOMEvent.md)
- [useWindowEvent](useWindowEvent.md)
