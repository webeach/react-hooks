# `useNumber`

## Description

`useNumber` is a hook for managing **numeric state** with convenient methods: `setValue`, `increment`, `decrement`, `reset`. It returns a *hybrid* structure that supports both **tuple** and **object** destructuring.

---

## Signature

```ts
function useNumber(initialValue?: number): UseNumberReturn;
```

- **Parameters**
   - `initialValue?: number` — starting value; defaults to `0`.

- **Returns**: `UseNumberReturn` — a hybrid structure with fields/positions:
   - `value: number` — current value;
   - `setValue(newValue: number): void` — replace the value with an explicit number;
   - `increment(step?: number): void` — increase by `step` (defaults to `1`);
   - `decrement(step?: number): void` — decrease by `step` (defaults to `1`);
   - `reset(): void` — reset back to the initial `initialValue`.
   - tuple access: `[value, setValue, increment, decrement, reset]`.

---

## Examples

### 1) Basic counter (tuple)

```tsx
import { useNumber } from '@webeach/react-hooks/useNumber';

export function Counter() {
  const [count, setCount, inc, dec, reset] = useNumber(5);

  return (
    <div>
      <output>{count}</output>
      <button onClick={() => inc()}>+1</button>
      <button onClick={() => dec()}>-1</button>
      <button onClick={() => setCount(42)}>set 42</button>
      <button onClick={() => reset()}>reset</button>
    </div>
  );
}
```

### 2) Object access and steps

```tsx
import { useNumber } from '@webeach/react-hooks/useNumber';

export function Stepper() {
  const counter = useNumber(0);

  return (
    <div>
      <output>{counter.value}</output>
      <button onClick={() => counter.increment(10)}>+10</button>
      <button onClick={() => counter.decrement(5)}>-5</button>
      <button onClick={() => counter.reset()}>reset</button>
    </div>
  );
}
```

### 3) Numeric input field

```tsx
import { useNumber } from '@webeach/react-hooks/useNumber';

export function NumericInput() {
  const state = useNumber(0);

  return (
    <label>
      <input
        type="number"
        value={state.value}
        onChange={(event) => state.setValue(Number(event.target.value))}
      />
      <button onClick={() => state.increment()}>+1</button>
      <button onClick={() => state.decrement()}>-1</button>
    </label>
  );
}
```

---

## Behavior

1. **Hybrid structure**
   - Both forms are available: tuple `[value, setValue, increment, decrement, reset]` and object `{ value, setValue, increment, decrement, reset }`.

2. **Stable actions**
   - Methods `setValue`, `increment`, `decrement`, `reset` are stable between renders; safe to include in effect/callback dependency arrays.

3. **Default step and sign**
   - If `step` is not provided, `1` is used. A negative step flips direction (e.g., `increment(-2)` decreases by 2).

4. **Reset to the initial value**
   - `reset()` returns to the **latest** `initialValue` provided to the hook on the current render.

5. **No range checks**
   - The hook does not enforce bounds. For `min/max`, add your own wrapper (clamping) around `setValue`/`increment`/`decrement`.

---

## When to Use

- Counters, quantities (qty), pagination, offset indices.
- Simple numeric settings (steps, limits) when you need `+`, `−`, and reset actions.
- When a stable API with explicit actions is preferable to ad‑hoc calculations in each handler.

---

## When **Not** to Use

- If you need complex transition logic/validation — use `useReducer` or a custom hook.
- If you need to memoize a **derived** value rather than store state — use `useMemo`.
- If the value must support controlled/uncontrolled modes (`value`/`defaultValue`) — use `useControlled`.

---

## Common Mistakes

1. **Expecting a functional setter**
   - `setValue` takes a **number**, not a function like `(prev) => next`. For relative changes, use `increment`/`decrement`.

2. **Resetting to “zero” instead of the initial**
   - `reset()` returns to `initialValue`, which isn’t necessarily `0`.

3. **Passing the handler directly**
   - Avoid `onClick={setValue}` — the event object would be passed as a number and result in `NaN`. Use a wrapper: `onClick={() => setValue(0)}`.

4. **String values from `<input>`**
   - `event.target.value` is a string. Convert it: `Number(event.target.value)` or `parseFloat(...)`.

---

## Typing

**Exported types**

- `UseNumberReturn`
   - Hybrid return type combining object and tuple forms.

- `UseNumberReturnObject`
   - Object form: `{ value: number; setValue: (value: number) => void; increment: (step?: number) => void; decrement: (step?: number) => void; reset: () => void }`.

- `UseNumberReturnTuple`
   - Tuple form: `[value: number, setValue: (value: number) => void, increment: (step?: number) => void, decrement: (step?: number) => void, reset: () => void]`.

---

## See also

- [useBoolean](useBoolean.md)
- [useControlled](useControlled.md)
- [useToggle](useToggle.md)
