# `useTimeout`

## Description

`useTimeout` starts a one‑shot timer and returns the **completion flag**.

Supports two call forms:
- **duration only** (in milliseconds);
- **callback + duration**.

The result can be used as a **tuple** (`[isDone]`) or as an **object** (`{ isDone }`).

---

## Signature

```ts
// Variant 1: duration only
function useTimeout(ms: number): UseTimeoutReturn;

// Variant 2: callback + duration
function useTimeout(callback: UseTimeoutCallback, ms: number): UseTimeoutReturn;
```

- **Parameters**
   - `ms` — timeout duration in milliseconds.
   - `callback` *(optional)* — a function invoked after the timeout completes. Receives the **actual elapsed time** in milliseconds.

- **Returns**
   - A hybrid structure accessible as:
      - Tuple: `[isDone]`
      - Object: `{ isDone }`

---

## Behavior

1. On first use, a timer is created with the specified duration.
2. When the timer finishes:
   - if the `isDone` value is **used** by the component, it flips to `true`;
   - if a `callback` was provided, it is called with the **actual** elapsed time.
3. If the component unmounts before completion, the timeout is cleared.
4. When `ms` changes, the existing timer is **restarted** with the new duration.

---

## Examples

### 1) Flag only

```tsx
import { useTimeout } from '@webeach/react-hooks/useTimeout';

function Loader() {
  const { isDone } = useTimeout(2000);

  return isDone ? <span>Done!</span> : <span>Loading…</span>;
}
```

### 2) With a callback

```tsx
import { useTimeout } from '@webeach/react-hooks/useTimeout';

function Example() {
  useTimeout((elapsed) => {
    console.log(`Timer finished after ${elapsed} ms`);
  }, 1000);

  return <p>Waiting 1 second…</p>;
}
```

---

## When to Use

- Show a loading indicator for a fixed time.
- Trigger an action after a delay.
- Obtain the **actual** elapsed time of a timer (e.g., for logging/metrics).

---

## When **Not** to Use

- You need **periodic** execution — prefer `useLoop`.
- You must update state immediately upon **unmount/cancel** — use a controlled effect or `AbortController` logic instead.
- You need to manage **multiple** timers — consider a custom timer manager.

---

## Common Mistakes

- Relying on `isDone` without accounting for its **lazy** update: the flag updates only if it is actually read/used by the component.
- Expecting the `callback` to fire at **exactly** `ms` — real timing depends on browser load and the event loop; use the provided `elapsed` value.

---

## Typing

**Exported types**

- `UseTimeoutCallback`
   - Callback invoked after the timeout completes: `(actualTime: number) => void`.
    - `actualTime` — the **actual** time (ms) elapsed since start.

- `UseTimeoutReturn`
   - Hybrid: tuple `[isDone]` **and** object `{ isDone }`.

- `UseTimeoutReturnObject`
   - Object form: `{ isDone: boolean }`.

- `UseTimeoutReturnTuple`
   - Tuple form: `[isDone: boolean]`.

---

## See Also

- [useFrame](useFrame.md)
- [useFrameExtended](useFrameExtended.md)
- [useLoop](useLoop.md)
- [useTimeoutExtended](useTimeoutExtended.md)
