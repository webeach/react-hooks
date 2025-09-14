# `useIntersectionObserver`

## Description

`useIntersectionObserver` is a hook for observing a DOM element’s visibility via the native `IntersectionObserver`.
It subscribes to the element from `ref`, can invoke a **callback** on each change, and exposes a **lazily‑activated** `currentEntry` field with the observer’s latest record.

The hook returns a *hybrid* structure: you can destructure it as a **tuple** (`[currentEntry]`) or as an **object** (`{ currentEntry }`).

---

## Signature

```ts
function useIntersectionObserver<ElementType extends Element | null>(
  ref: RefObject<ElementType | null>,
  callback?: UseIntersectionObserverCallback,
): UseIntersectionObserverReturn;
```

- **Parameters**
   - `ref` — a ref object to the element whose visibility should be tracked.
   - `callback?` — a function called on each change; receives the current `IntersectionObserverEntry`.

- **Returns**: `UseIntersectionObserverReturn`
   - A hybrid object/tuple with `currentEntry: IntersectionObserverEntry | null` — the latest observer record (updated as changes occur; re-renders are **enabled after the first external access** to this field).

---

## Examples

### 1) Check whether an element is in view

```tsx
import { useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@webeach/react-hooks/useIntersectionObserver';

export function Section() {
  const ref = useRef<HTMLDivElement>(null);
  const { currentEntry } = useIntersectionObserver(ref);

  useEffect(() => {
    if (currentEntry?.isIntersecting) {
      console.log('Element is visible on screen');
    }
  }, [currentEntry]);

  return <div ref={ref} style={{ height: 300 }}>Section</div>;
}
```

### 2) Side effects via `callback` only

```tsx
import { useRef } from 'react';
import { useIntersectionObserver } from '@webeach/react-hooks/useIntersectionObserver';

export function AnalyticsTracker() {
  const ref = useRef<HTMLElement>(null);

  useIntersectionObserver(ref, (entry) => {
    if (entry.isIntersecting) {
      console.log('Send analytics event: element appeared');
    }
  });

  return <section ref={ref} style={{ minHeight: 400 }} />;
}
```

### 3) Lazy-loading images

```tsx
import { useRef, useEffect, useState } from 'react';
import { useIntersectionObserver } from '@webeach/react-hooks/useIntersectionObserver';

export function LazyImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const { currentEntry } = useIntersectionObserver(ref);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (currentEntry?.isIntersecting) {
      setLoaded(true);
    }
  }, [currentEntry]);

  return <img ref={ref} src={loaded ? src : undefined} alt={alt} />;
}
```

---

## Behavior

1. **Subscription & resubscription**
   - The observer attaches to `ref.current` after mount and re-attaches when the element changes.

2. **Lazy reactivity for `currentEntry`**
   - Re-renders for `currentEntry` are enabled on the first external read. Until it is read, updates do **not** trigger re-renders.

3. **Callback is independent of `currentEntry`**
   - If `callback` is provided, it runs on every intersection change regardless of whether `currentEntry` is used.

4. **Cleanup**
   - The observer is automatically disconnected on unmount and when the target element changes.

5. **SSR-safe**
   - Subscription logic runs only in the browser; no side effects execute during server rendering.

---

## When to Use

1. **Lazy loading**
   - Load images, video, or data only when the element enters the viewport.

2. **Scroll-triggered animations**
   - Start animations when a block appears on screen.

3. **Analytics**
   - Track section/banner views without global scroll listeners.

---

## When **Not** to Use

1. **One-off visibility check**
   - For a single position calculation, `getBoundingClientRect` is sufficient.

2. **If only window scrolling matters**
   - Prefer global events (`scroll`, `resize`) instead of a per-element observer.

---

## Common Mistakes

1. **`ref` not attached to an element**
   - If `ref.current === null`, no subscription happens. Ensure the ref is passed to the intended element.

2. **Expecting re-renders without reading `currentEntry`**
   - If you rely only on `callback`, the component won’t re-render — this is by design.

3. **Accidental resubscription**
   - Keep the `ref` stable; don’t create a new ref on each render.

---

## Types

**Exported types**

- `UseIntersectionObserverCallback`
   - `(entry: IntersectionObserverEntry) => void`.

- `UseIntersectionObserverReturn`
   - Hybrid: object `{ currentEntry: IntersectionObserverEntry | null }` **and** tuple `[currentEntry: IntersectionObserverEntry | null]`.

- `UseIntersectionObserverReturnObject`
   - Object form: `{ currentEntry: IntersectionObserverEntry | null }`.

- `UseIntersectionObserverReturnTuple`
   - Tuple form: `[currentEntry: IntersectionObserverEntry | null]`.

---

## See also

- [useResizeObserver](useResizeObserver.md)
