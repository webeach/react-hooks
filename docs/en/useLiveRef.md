# `useLiveRef`

## Description

`useLiveRef` is a hook that always returns the **same** `ref` object whose `.current` property is updated on every render to the **latest** provided value. It’s useful when you need to read fresh values inside callbacks, effects, timers, event handlers, etc., **without** resubscribing or triggering re-renders.

---

## Signature

```ts
function useLiveRef<Value>(value: Value): React.RefObject<Value>;
```

- **Parameters**
   - `value: Value` — the current value that should be available via `ref.current`.
- **Returns**
   - `RefObject<Value>` — a stable `ref` object (does not change between renders) whose `ref.current` always points to the latest `value`.

---

## Examples

### 1) Access the latest value inside a browser event handler

```tsx
import { useEffect } from 'react';
import { useLiveRef } from '@webeach/react-hooks/useLiveRef';

export function CursorTracker({ enabled }: { enabled: boolean }) {
  const enabledRef = useLiveRef(enabled);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      // Read the up-to-date flag from the ref instead of a stale first-render closure
      if (!enabledRef.current) {
        return;
      }
      // ...handler logic
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [enabledRef]); // enabledRef is stable; the effect isn’t recreated when `enabled` changes (you can omit it from deps if you prefer)

  return null;
}
```

### 2) Fresh props inside `setInterval`

```tsx
import { useEffect } from 'react';
import { useLiveRef } from '@webeach/react-hooks/useLiveRef';

export function Poller({ intervalMs, onTick }: { intervalMs: number; onTick: () => void }) {
  const onTickRef = useLiveRef(onTick);

  useEffect(() => {
    const id = setInterval(() => {
      // No need to recreate the interval when `onTick` changes
      onTickRef.current();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, onTickRef]);

  return null;
}
```

### 3) Stable callbacks that read fresh data inside

```tsx
import { useCallback, useState } from 'react';
import { useLiveRef } from '@webeach/react-hooks/useLiveRef';

export function Example() {
  const [count, setCount] = useState(0);
  const countRef = useLiveRef(count);

  // memoized callback doesn’t depend on `count`, but reads the fresh value inside
  const log = useCallback(() => {
    console.log('current count =', countRef.current);
  }, []);

  const handleButtonClick = () => {
    setCount((c) => c + 1);
    log();
  };

  return (
    <button onClick={handleButtonClick}>
      increment & log
    </button>
  );
}
```

---

## Behavior

1. **Stable `ref` object**
   - The returned `ref` is created once and **does not change** between renders. This lets you safely include it in effect/callback dependency arrays without unnecessary re-creations.

2. **`.current` updates on every render**
   - Inside the hook, `ref.current = value` runs on each render, so handlers always see the **freshest** value.

3. **No extra re-renders**
   - Updating `ref.current` **does not** cause a component re-render.

4. **SSR/ISR**
   - The hook doesn’t touch `window`/`document` and is safe to run on the server. During SSR, `ref.current` equals the last `value` provided at render time.

5. **Compared to alternatives**
   - Unlike plain `useRef(initial)`, where you must update `.current` yourself, `useLiveRef` does it automatically on each render.
   - Unlike storing the value in `useState`, `useLiveRef` doesn’t trigger re-renders when `.current` changes.
   - Unlike a closure, `useLiveRef` doesn’t “freeze” values: handlers read the **current** one.

---

## When to Use

- You need the latest value inside long-lived subscriptions: `addEventListener`, `MutationObserver`, `ResizeObserver`, `setInterval`, `requestAnimationFrame`, WebSocket callbacks, etc.
- You want to keep callbacks and effects **stable** (not depending on frequently changing values) while still reading **fresh** data.

---

## When **Not** to Use

- If you need the UI to **react** to value changes — use `useState`/`useReducer`. `useLiveRef` does not re-render the component.

---

## Common Mistakes

1. **Expecting re-renders from a `ref`**
   - Updating `ref.current` does not trigger a re-render. If your UI depends on that value, use state.

2. **Putting volatile values into effect deps**
   - The goal of `useLiveRef` is to avoid unnecessary effect/callback re-creations. Keep the **ref itself** in deps rather than the changing value living inside it.

---

## See also

- [useRefEffect](useRefEffect.md)
- [useRefState](useRefState.md)
