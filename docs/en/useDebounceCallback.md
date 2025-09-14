# `useDebounceCallback`

## Description

`useDebounceCallback` returns a **debounced function** that delays invoking the provided `callback` until after `delayMs` milliseconds have passed since the **last** call. Useful for noisy events (input, resize, scroll) when you want the logic to run **once** with the **latest** arguments.

- Provides a **stable function reference** (safe to pass as a handler).
- Always uses the **latest** version of `callback` when executed.
- Automatically clears the timer on unmount (no late calls).

---

## Signature

```ts
function useDebounceCallback<Args extends any[]>(
  callback: (...args: Args) => unknown,
  delayMs: number,
): (...args: Args) => void;
```

**Parameters**
- `callback` — the function to debounce. Called with the **latest** arguments after `delayMs`.
- `delayMs` — debounce delay in milliseconds.

**Returns**
- A debounced function `(...args) => void` with a **stable** identity.

---

## Behavior

1. Each new call **restarts** the timer; only one call is executed after `delayMs` with the **latest** arguments.
2. Changing `delayMs` does **not affect** an already scheduled call; the new delay applies only to the **next** invocation.
3. On unmount, the timer is cleared — the pending call will **not** run.
4. The returned function reference is stable across renders, but it always executes the **latest** `callback`.

---

## Examples

### 1) Search input

```tsx
import { useState } from 'react';
import { useDebounceCallback } from '@webeach/react-hooks/useDebounceCallback';

export function SearchBox() {
  const [query, setQuery] = useState('');

  const request = useDebounceCallback((q: string) => {
    fetch(`/api/search?q=${encodeURIComponent(q)}`);
  }, 300);

  return (
    <input
      value={query}
      onChange={(event) => {
        const value = event.currentTarget.value;
        setQuery(value);
        request(value);
      }}
      placeholder="Search..."
    />
  );
}
```

### 2) Resize: reflow calculation at most once every N ms

```tsx
import { useEffect } from 'react';
import { useDebounceCallback } from '@webeach/react-hooks/useDebounceCallback';

export function LayoutObserver() {
  const recompute = useDebounceCallback(() => {
    // heavy layout work
  }, 200);

  useEffect(() => {
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [recompute]);

  return null;
}
```

### 3) Changing delay dynamically

```tsx
import { useState } from 'react';
import { useDebounceCallback } from '@webeach/react-hooks/useDebounceCallback';

export function AdjustableDelay() {
  const [delay, setDelay] = useState(500);

  const debouncedLog = useDebounceCallback((value: string) => {
    console.log(value);
  }, delay);

  // The new delay is applied to the NEXT call
  return (
    <>
      <input onChange={(event) => debouncedLog(event.currentTarget.value)} />
      <button onClick={() => setDelay((d) => (d === 500 ? 1000 : 500))}>
        Toggle delay
      </button>
    </>
  );
}
```

---

## When to use

- For noisy events where only the **final** value matters (typing, autocomplete, filters).
- To reduce the frequency of expensive operations (layout recalculation, API requests).
- When you want to trigger a handler once after a pause in user input.

## When **not** to use

- If you need the **first call immediately** and only want to limit the rate of subsequent calls — use **`useThrottle`** instead.
- If you need both **leading** and **trailing** behavior — this hook only supports **trailing** execution.

---

## Common mistakes

1. **Expecting execution after the *first* call**
   - Debounce waits for `delayMs` after the **last** call, not the first.

2. **Assuming `delayMs` change cancels pending call**
   - A scheduled call still executes with the old delay. The new `delayMs` is applied only to the **next** invocation.

---

## See also

- [useCallbackCompare](useCallbackCompare.md)
- [useDebounceState](useDebounceState.md)
- [useThrottleCallback](useThrottleCallback.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
