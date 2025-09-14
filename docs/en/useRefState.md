# `useRefState`

## Description

`useRefState` is a hook that combines a **value stored in a ref** with **optional re-renders**. It lets you update the value **without re-rendering** (default) and opt-in to reactivity so subsequent changes cause component re-renders when you want them.

Returns a tuple of three elements: `[stateRef, setRefState, actions]`.

---

## Signature

```ts
// 1) Without an initial value
function useRefState<ValueType = undefined>(): readonly [
  stateRef: React.RefObject<ValueType | undefined>,
  setRefState: (
    value:
      | ValueType
      | ((prev: ValueType | undefined) => ValueType | undefined)
      | undefined,
  ) => void,
  actions: { disableUpdate(): void; enableUpdate(forceUpdate?: boolean): void },
];

// 2) With an initial value and initial reactivity
function useRefState<ValueType>(
  initialValue: ValueType | (() => ValueType),
  initialUpdatable?: boolean,
): readonly [
  stateRef: React.RefObject<ValueType>,
  setRefState: (value: ValueType | ((prev: ValueType) => ValueType)) => void,
  actions: { disableUpdate(): void; enableUpdate(forceUpdate?: boolean): void },
];
```

- **Parameters**
   - `initialValue` — the initial value or a lazy initializer function.
   - `initialUpdatable` — whether to enable re-renders **immediately** (default `false`).

- **Returns**: tuple
   - `stateRef` — a ref whose `stateRef.current` holds the **latest** value.
   - `setRefState(next)` — updates `stateRef.current`. When reactivity is enabled, triggers a re-render.
   - `actions` — `{ disableUpdate(), enableUpdate(forceUpdate?) }` for toggling reactivity.

---

## Examples

### 1) Frequent updates without re-render + selective syncing

```tsx
import { useEffect } from 'react';
import { useRefState } from '@webeach/react-hooks/useRefState';

export function Stopwatch() {
  const [timeRef, setTime, { enableUpdate, disableUpdate }] = useRefState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // update the ref every 10 ms without re-rendering
      setTime((time) => time + 10);
    }, 10);
    return () => clearInterval(id);
  }, [setTime]);

  return (
    <div>
      <div>{timeRef.current} ms</div>
      <button onClick={() => enableUpdate(true)}>Start syncing</button>
      <button onClick={() => disableUpdate()}>Stop syncing</button>
    </div>
  );
}
```

---

## Behavior

1. **Updates without re-renders (default)**
   - `setRefState(next)` changes `stateRef.current` and **does not** re-render while reactivity is disabled.

2. **Enable/disable reactivity**
   - `disableUpdate()` — turns off re-renders for future `setRefState` calls.
   - `enableUpdate()` — turns on re-renders for **subsequent** changes (no immediate sync by itself).

3. **`enableUpdate(true)`**
   - Enables reactivity **and immediately triggers a re-render if** the currently rendered value differs from `stateRef.current`.
   - This is **not** a one-off sync: after calling it, subsequent `setRefState` updates will re-render until you call `disableUpdate()`. If you need a single forced render, consider a dedicated `useForceUpdate`.

4. **Setter accepts a value or an updater**
   - Pass a ready value (`setRefState(next)`) or a functional updater (`setRefState(prev => next)`).

5. **Stable references**
   - Returned functions and objects are stable; it’s safe to use them in effect/callback dependency arrays.

---

## When to Use

- High-frequency/imperative updates where re-rendering on every tick is undesirable (timers, cursor position, sizes, external APIs).
- Storing objects whose lifetime should be independent from React re-renders (WebSocket, AudioContext, maps, caches).
- Stepwise/manual UI synchronization with internal state.

---

## When **Not** to Use

- If the UI **must always** react to value changes — use `useState`/`useReducer`.
- If you need immutability guarantees and deterministic re-renders — prefer regular state.

---

## Common Mistakes

1. **Assuming `enableUpdate(true)` is a one-time re-render**
   - In fact, it **enables** reactivity and triggers a re-render only if the value changed; subsequent updates will also re-render until `disableUpdate()`.

2. **In-place mutation of complex objects**
   - If you store an object, create a new object in the functional setter (`{ ...prev, changed }`) instead of mutating in place.

3. **Forgetting to enable reactivity**
   - If the UI doesn’t update, make sure you called `enableUpdate()` (or `enableUpdate(true)`).

---

## Typing

**Exported types**

- `UseRefStateActions`
   - Methods to control reactivity:
      - `disableUpdate(): void` — turns off updates (no re-renders on future `setRefState`).
      - `enableUpdate(forceUpdate?: boolean): void` — turns on updates; with `forceUpdate: true` triggers an immediate re-render if needed.

- `UseRefStateDispatch<ValueType>`
   - Functional updater: `(prevState: ValueType) => ValueType`.

- `UseRefStateReturn<ValueType>`
   - Tuple: `[stateRef: MutableRefObject<ValueType>, setRefState: (value: ValueType | UseRefStateDispatch<ValueType>) => void, actions: UseRefStateActions]`.

---

## See Also

- [useDemandStructure](useDemandStructure.md)
