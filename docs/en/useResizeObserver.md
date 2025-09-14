# `useResizeObserver`

## Description

`useResizeObserver` is a hook for observing **element size changes** via the native `ResizeObserver`. It subscribes to the element from a `ref`, can invoke a **callback** on each change, and exposes a **lazily‑activated** `currentEntry` field with the observer’s latest record.

The hook returns a *hybrid* structure: you can destructure it as a **tuple** (`[currentEntry]`) or as an **object** (`{ currentEntry }`).

---

## Signature

```ts
function useResizeObserver<ElementType extends Element | null>(
  ref: RefObject<ElementType | null>,
  callback?: UseResizeObserverCallback,
): UseResizeObserverReturn;
```

- **Parameters**
   - `ref` — a ref object to the element whose size should be tracked.
   - `callback?` — a function called on each change; receives the current `ResizeObserverEntry`.

- **Returns**: `UseResizeObserverReturn`
   - A hybrid object/tuple with `currentEntry: ResizeObserverEntry | null` — the latest observer record (updated as changes occur; re‑renders are **enabled after the first external access** to this field).

---

## Examples

### 1) Read width/height via object access

```tsx
import { useRef, useEffect } from 'react';
import { useResizeObserver } from '@webeach/react-hooks/useResizeObserver';

export function BoxInfo() {
  const ref = useRef<HTMLDivElement>(null);
  const { currentEntry } = useResizeObserver(ref);

  useEffect(() => {
    if (currentEntry) {
      console.log('size:', currentEntry.contentRect.width, currentEntry.contentRect.height);
    }
  }, [currentEntry]);

  return <div ref={ref} style={{ resize: 'both', overflow: 'auto' }} />;
}
```

### 2) Side effects via `callback` only

```tsx
import { useRef } from 'react';
import { useResizeObserver } from '@webeach/react-hooks/useResizeObserver';

export function SyncCssVar() {
  const ref = useRef<HTMLElement>(null);

  useResizeObserver(ref, (entry) => {
    // We don’t use currentEntry → no extra re‑renders
    entry.target.setAttribute(
      'style',
      `--w:${entry.contentRect.width}px; --h:${entry.contentRect.height}px;`
    );
  });

  return <section ref={ref} />;
}
```

### 3) A list that adapts its column count

```tsx
import { useRef, useMemo } from 'react';
import { useResizeObserver } from '@webeach/react-hooks/useResizeObserver';

export function ResponsiveGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [entry] = useResizeObserver(ref);

  const columns = useMemo(() => {
    const w = entry?.contentRect.width ?? 0;
    return w > 1000 ? 4 : w > 700 ? 3 : w > 400 ? 2 : 1;
  }, [entry]);

  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {/* ...items */}
    </div>
  );
}
```

---

## Behavior

1. **Subscription & resubscription**
   - The observer attaches to `ref.current` after mount and re‑attaches when the element changes.

2. **Lazy reactivity for `currentEntry`**
   - Re‑renders for `currentEntry` are enabled on the first external read. Until it is read, updates do **not** trigger re‑renders.

3. **Callback is independent of `currentEntry`**
   - If `callback` is provided, it runs on every size change regardless of whether `currentEntry` is used.

4. **Cleanup**
   - The observer is automatically disconnected on unmount and when the target element changes.

5. **SSR‑safe**
   - Subscription logic runs only in the browser; no side effects execute during server rendering.

---

## When to Use

1. **Adaptive components**
   - Track container size and adjust layout/styles on changes.

2. **Graphics/canvas integrations**
   - Fit canvases, scales, and viewports to the container without global window listeners.

3. **Local optimization**
   - Observe only the element you need instead of `window.resize`.

---

## When **Not** to Use

1. **Rare one‑off measurements**
   - For one‑time reads, `getBoundingClientRect` in an effect is enough.

2. **You only care about window size**
   - Prefer a hook for `window` events (e.g., `useWindowEvent('resize', ...)`).

---

## Common Mistakes

1. **`ref` not attached to an element**
   - If `ref.current === null`, no subscription happens. Ensure the ref is passed to the intended element.

2. **Expecting re‑renders without reading `currentEntry`**
   - If you rely only on the `callback`, the component won’t re‑render — this is by design.

3. **Mutating data from `currentEntry`**
   - Treat `ResizeObserverEntry` as a snapshot: read its values; don’t try to mutate them.

4. **Accidental resubscription**
   - Keep the `ref` stable; don’t create a new ref on each render.

---

## Typing

- **Exported types**
   - `UseResizeObserverCallback` — `(entry: ResizeObserverEntry) => void`.
   - `UseResizeObserverReturn` — hybrid form (object **and** tuple).
   - `UseResizeObserverReturnObject` — `{ currentEntry: ResizeObserverEntry | null }`.
   - `UseResizeObserverReturnTuple` — `[currentEntry: ResizeObserverEntry | null]`.

---

## See also

- [useIntersectionObserver](useIntersectionObserver.md)
