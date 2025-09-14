# `useToggle`

## Description

`useToggle` is a hook for managing a boolean state with a single `toggle` method. It returns a *hybrid* structure that supports both **tuple** and **object** destructuring.

`toggle` semantics:
- without an argument — **flips** the current value `true ⇄ false`;
- with `true`/`false` — **forces** the provided value.

---

## Signature

```ts
function useToggle(initialValue?: boolean): UseToggleReturn;
```

- **Parameters**
   - `initialValue?: boolean` — initial value; defaults to `false`.

- **Returns**: `UseToggleReturn` — a hybrid structure with fields/positions:
   - `value: boolean` — current value;
   - `toggle(force?: boolean): void` — flip the value or set it explicitly;
   - tuple access: `[value, toggle]`.

---

## Examples

### 1) Basic usage (tuple)

```tsx
import { useToggle } from '@webeach/react-hooks/useToggle';

export function PasswordField() {
  const [visible, toggle] = useToggle(false);

  return (
    <label>
      <input type={visible ? 'text' : 'password'} />
      <button type="button" onClick={() => toggle()}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </label>
  );
}
```

### 2) Force a specific value

```tsx
import { useToggle } from '@webeach/react-hooks/useToggle';

export function Filters() {
  const state = useToggle(true);

  return (
    <div>
      <button onClick={() => state.toggle(false)}>Disable</button>
      <button onClick={() => state.toggle(true)}>Enable</button>
      <button onClick={() => state.toggle()}>Toggle</button>
      <div>Enabled: {String(state.value)}</div>
    </div>
  );
}
```

### 3) Keyboard control

```tsx
import { useEffect } from 'react';
import { useToggle } from '@webeach/react-hooks/useToggle';

export function KeyboardControlled() {
  const { value, toggle } = useToggle(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 't') toggle();      // flip
      if (e.key === '1') toggle(true);  // force on
      if (e.key === '0') toggle(false); // force off
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  return <div>Active: {String(value)}</div>;
}
```

---

## Behavior

1. **Simple state model**
   - Stores a single boolean value (`useState`).

2. **Memoized action**
   - `toggle` is memoized with `useCallback` and is **stable** between renders.
   - The function keeps reference identity, so it’s safe to include in `useEffect`/`useCallback` dependency arrays.

3. **Hybrid structure**
   - Thanks to `useDemandStructure`, both **tuple** and **object** forms are available without duplicate computations.

4. **No side effects**
   - SSR/ISR‑safe; no access to global browser objects.

---

## When to Use

- UI toggles: show/hide, on/off, open/close.
- When a single universal action `toggle(force?)` is convenient for both flipping and forcing a value.

---

## When **Not** to Use

- If you need more than `true/false` (e.g., a tri‑state flag) — use `useState` with an enum or a specialized hook.
- If you need complex transition logic — consider `useReducer`.

---

## Common Mistakes

1. **Expecting `setTrue`/`setFalse` to exist**
   - This hook exposes only `value` and `toggle(force?)`. For explicit actions, use `useBoolean`.

2. **Wrong effect dependencies**
   - In effects, depend on `toggle`, not `value`, if the logic doesn’t rely on the current boolean.

3. **Passing `toggle` directly to event handlers**
   - Using `onClick={toggle}` passes the event object as the `force` argument, which is truthy and will act like `toggle(true)`. Wrap it instead: `onClick={() => toggle()}` or set a value explicitly: `onClick={() => toggle(false)}` / `onClick={() => toggle(true)}`.

---

## Typing

**Exported types**

- `UseToggleFunction`
   - Boolean state updater: `(force?: boolean) => void`.
      - No argument — inverts the current value.
      - `true`/`false` — sets the value explicitly.

- `UseToggleReturn`
   - Hybrid: tuple `[value, toggle]` **and** object `{ value, toggle }`.

- `UseToggleReturnObject`
   - Object form: `{ value: boolean; toggle: UseToggleFunction }`.

- `UseToggleReturnTuple`
   - Tuple form: `[value: boolean, toggle: UseToggleFunction]`.

---

## See Also

- [useBoolean](useBoolean.md)
- [useControlled](useControlled.md)
- [useNumber](useNumber.md)
