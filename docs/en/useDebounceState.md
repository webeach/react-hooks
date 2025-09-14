# `useDebounceState`

## Description

`useDebounceState` is a state hook with a **debounced setter**. Each new assignment resets the timer and delays the update by `delayMs` milliseconds, collapsing a burst of rapid calls into a single update — with the **latest value** (trailing debounce).

- Provides a **stable setter reference**.
- Always uses the latest values when applying updates.
- Automatically clears any pending update on unmount (no late writes).

---

## Signature

```ts
// Variant 1: only delay, initial state is undefined
function useDebounceState<State = undefined>(
  delayMs: number,
): UseDebounceStateReturn<State | undefined>;

// Variant 2: explicit initial state
function useDebounceState<State>(
  initialState: State | (() => State),
  delayMs: number,
): UseDebounceStateReturn<State>;
```

**Parameters**
- `initialState` — initial value or lazy initializer (optional).
- `delayMs` — debounce delay in milliseconds.

**Returns**
- Tuple `[state, setDebounceState]`:
   - `state` — current state value.
   - `setDebounceState(next)` — debounced setter (stable reference).

---

## Behavior

1. Each new call to `setDebounceState` **restarts the timer**; only the last value is applied after `delayMs`.
2. Functional updates are supported: `setDebounceState(prev => next)`; the last function in the series wins.
3. Changing `delayMs` does **not affect** an already scheduled update — the new delay is applied only on the next setter call.
4. The setter reference is stable between renders; safe for `deps` and subscriptions.
5. On unmount, any pending update is cleared — no delayed writes after unmount.

---

## Examples

### 1) Input field with debounced sync

```tsx
import { useDebounceState } from '@webeach/react-hooks/useDebounceState';

export function SearchBox() {
  const [query, setQuery] = useDebounceState('', 300);

  return (
    <input
      value={query ?? ''}
      onChange={(event) => setQuery(event.currentTarget.value)}
      placeholder="Search..."
    />
  );
}
```

### 2) Functional updates

```tsx
import { useDebounceState } from '@webeach/react-hooks/useDebounceState';

export function Counter() {
  const [count, setCount] = useDebounceState(0, 200);

  return (
    <button onClick={() => setCount((x) => x + 1)}>+1 (debounced)</button>
  );
}
```

### 3) Adjustable delay

```tsx
import { useState } from 'react';
import { useDebounceState } from '@webeach/react-hooks/useDebounceState';

export function Adjustable() {
  const [delay, setDelay] = useState(500);
  const [text, setText] = useDebounceState('', delay);
  // The new delay takes effect only on the next setter call

  return (
    <>
      <input onChange={(e) => setText(e.currentTarget.value)} />
      <button onClick={() => setDelay((d) => (d === 500 ? 1000 : 500))}>
        Toggle delay
      </button>
      <div>Value: {text}</div>
    </>
  );
}
```

---

## When to use

- Handling **noisy input sources**: typing, dragging, sliders.
- Reducing the frequency of expensive computations or API calls.
- When you want a state hook that behaves like `useState`, but with **debounced updates**.

## When **not** to use

- If you need the **first call immediately** and only throttle subsequent calls — use `useThrottleState`.
- If you require **leading** or **leading+trailing** behavior — this hook only provides trailing.
- If you need strict periodic updates — use `useLoop`.

---

## Common mistakes

1. **Expecting update after the first call**
   - Debounce waits until after the last call, not the first.

2. **Assuming `delayMs` change cancels a pending update**
   - The current scheduled update will still run with the old delay. The new delay applies only on the next setter call.

---

## Typing

**Exported types**

- `UseDebounceStateSetAction<State>`
   - Either a direct value `State`.
   - Or a functional updater: `(prev: State) => State`.

- `UseDebounceStateDispatch<State>`
   - Debounced state setter: `(action: UseDebounceStateSetAction<State>) => void`.

- `UseDebounceStateReturn<State>`
   - Tuple: `[state: State, setDebounceState: UseDebounceStateDispatch<State>]`.

---

## See also

- [useDebounceCallback](useDebounceCallback.md)
- [usePatchDeepState](usePatchDeepState.md)
- [usePatchState](usePatchState.md)
- [useThrottleState](useThrottleState.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
