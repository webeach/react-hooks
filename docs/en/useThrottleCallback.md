# `useThrottleCallback`

## Description

`useThrottleCallback` returns a **throttled** function that limits how often `callback` can run within a `delayMs` window.

Default semantics are **leading + trailing**:
- **leading**: the first call after a quiet period runs **immediately**;
- **trailing**: subsequent calls within the window don’t invoke `callback` right away, but **one** deferred call will run at the end of the window with the **latest** arguments.

— stable function reference;  
— always uses the **latest** `callback` and `delayMs`;  
— automatically clears any pending call on unmount.

---

## Signature

```ts
function useThrottleCallback<Args extends any[]>(
  callback: (...args: Args) => unknown,
  delayMs: number,
): (...args: Args) => void;
```

**Parameters**
- `callback` — the function to throttle. May run immediately (leading) and at most once at the end of the window (trailing) with the latest arguments.
- `delayMs` — the minimum interval (ms) between consecutive executions.

**Returns**
- A throttled function `(...args) => void` with a **stable** identity.

---

## Behavior (brief)

1. The first call after a pause invokes `callback` **immediately**.
2. Repeated calls **within the window** collapse into **one** deferred call at the end of the window; the **latest arguments** are used.
3. Changing `delayMs` does not affect an already scheduled deferred call; the new value applies to **subsequent** calls.
4. On unmount, any deferred call is **cancelled** automatically.

---

## Examples

### 1) Scroll: no more than once every 100 ms

```tsx
import { useEffect } from 'react';
import { useThrottleCallback } from '@webeach/react-hooks/useThrottleCallback';

export function ScrollHandler() {
  const onScrollThrottled = useThrottleCallback(() => {
    updateVisibleRegion();
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', onScrollThrottled);
    return () => window.removeEventListener('scroll', onScrollThrottled);
  }, [onScrollThrottled]);

  return null;
}
```

### 2) Resize/measurements: use the latest values

```tsx
import { useEffect } from 'react';
import { useThrottleCallback } from '@webeach/react-hooks/useThrottleCallback';

export function LayoutObserver({ container }: { container: HTMLElement }) {
  const recompute = useThrottleCallback((width: number) => {
    doLayout(width);
  }, 200);

  useEffect(() => {
    const handler = () => recompute(container.offsetWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [recompute, container]);

  return null;
}
```

### 3) Dynamically changing the delay

```tsx
import { useState } from 'react';
import { useThrottleCallback } from '@webeach/react-hooks/useThrottleCallback';

export function AdjustableThrottle() {
  const [delay, setDelay] = useState(500);
  const send = useThrottleCallback((payload: unknown) => {
    post('/analytics', payload);
  }, delay);

  // The new `delay` value applies to subsequent calls
  return (
    <>
      <button onClick={() => setDelay((d) => (d === 500 ? 200 : 500))}>
        Toggle delay
      </button>
      <button onClick={() => send({ ts: Date.now() })}>Send</button>
    </>
  );
}
```

---

## When to Use

- Limiting the frequency of expensive operations: recalculations, network requests, scroll/resize handlers.
- You need a quick **first** response and at most **one** call at the end of the window.
- You need a stable handler reference (for subscriptions and effect deps).

## When **Not** to Use

- You need exactly one call after inactivity — use `useDebounceCallback`.
- You need strictly **leading‑only** or **trailing‑only** behavior — this hook implements leading + trailing; specialized modes would require changes.
- You need a fixed periodic schedule — consider `useLoop`.

---

## Common Mistakes

- Expecting multiple trailing calls within the same window — there will be at most **one**.
- Assuming that changing `delayMs` will speed up an already scheduled trailing call — it won’t; it fires based on the old window.

---

## See also

- [useCallbackCompare](useCallbackCompare.md)
- [useDebounceCallback](useDebounceCallback.md)
- [useDebounceState](useDebounceState.md)
- [useThrottleState](useThrottleState.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
