# `useUnmount`

## Description

`useUnmount` is a hook that executes a given function **once on component unmount**.

- On mount, the hook does nothing.
- On unmount, it invokes the **latest** version of the callback (via `useLiveRef`) so the **final** version of your function runs.

---

## Signature

```ts
function useUnmount(callback: UseUnmountCallback): void;
```

- **Parameters**
   - `callback` — a function to run when the component unmounts.

- **Returns**: `void`.

---

## Examples

### 1) Unsubscribe from events
```tsx
import { useEffect } from 'react';
import { useUnmount } from '@webeach/react-hooks/useUnmount';

function onFocus() {
  // ...
}

export function Chat() {
  useEffect(() => {
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useUnmount(() => {
    window.removeEventListener('focus', onFocus);
  });

  return null;
}
```

### 2) Clearing a timer/interval
```tsx
import { useEffect } from 'react';
import { useUnmount } from '@webeach/react-hooks/useUnmount';

function tick() {
  // ...
}

export function Ticker() {
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useUnmount(() => {
    // optional fallback cleanup
    clearIntervalAllSomehow?.();
  });

  return null;
}
```

### 3) Save a draft / logging
```tsx
import { useUnmount } from '@webeach/react-hooks/useUnmount';

function saveDraft() {
  // ...
}

export function Editor() {
  useUnmount(() => {
    saveDraft();
    console.log('Editor unmounted');
  });
  return <textarea />;
}
```

---

## Behavior

1. **Unmount trigger**
   - The callback runs exactly once when the component unmounts.

2. **Callback freshness**
   - Uses `useLiveRef`, so the **most recent** `callback` is invoked even if it changed between renders.

3. **SSR‑safe**
   - Side effects are attached only in the browser. Nothing runs on the server.

---

## When to Use

- Releasing resources: timers, subscriptions, controllers, WebSockets.
- Saving state or sending analytics when leaving a page/section.
- Atomic finalization of operations started by the component.

## When **Not** to Use

- If cleanup can be returned from the same `useEffect` that created the resource — prefer doing it in the effect’s `return` cleanup.
- For logic that should run **on every update** — use `useEffect` with dependencies.

---

## Typing

**Exported types**

- `UseUnmountCallback`
   - A callback invoked on component unmount: `() => any`.

---

## See Also

- [useCallbackCompare](useCallbackCompare.md)
- [useEffectCompare](useEffectCompare.md)
- [useIsomorphicLayoutEffect](useIsomorphicLayoutEffect.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
- [useMemoCompare](useMemoCompare.md)
- [useRefEffect](useRefEffect.md)
