# `useBoolean`

## Description

`useBoolean` is a hook for managing a boolean state with convenient callbacks `setTrue` and `setFalse`.
The hook returns a *hybrid* structure that supports both **tuple** and **object** destructuring:

- Tuple: `[value, setTrue, setFalse]`
- Object: `{ value, setTrue, setFalse }`

This lets you choose whichever syntax is more convenient: compact tuple usage in components, or named access in more complex cases.

---

## Signature

```ts
function useBoolean(initialValue?: boolean): UseBooleanReturn;
```

- **Parameters**
   - `initialValue?: boolean` — initial state value, defaults to `false`.

- **Returns**: `UseBooleanReturn` — a hybrid structure with both tuple and object forms:
   - `value: boolean` — current state value.
   - `setTrue(): void` — sets the state to `true`.
   - `setFalse(): void` — sets the state to `false`.
   - Tuple access: `[value, setTrue, setFalse]`.

---

## Examples

### 1) Basic usage (tuple)

```tsx
import { useBoolean } from '@webeach/react-hooks/useBoolean';

export function ModalToggle() {
  const [isOpen, open, close] = useBoolean();

  return (
    <div>
      <button onClick={open}>Open modal</button>
      {isOpen && (
        <div role="dialog">
          <p>Content…</p>
          <button onClick={close}>Close</button>
        </div>
      )}
    </div>
  );
}
```

### 2) Named access (object)

```tsx
import { useBoolean } from '@webeach/react-hooks/useBoolean';

export function Details() {
  const bool = useBoolean(true); // start with true

  return (
    <section>
      <header>
        <button onClick={bool.setFalse}>Hide</button>
        <button onClick={bool.setTrue}>Show</button>
      </header>
      {bool.value && <div>Visible section</div>}
    </section>
  );
}
```

### 3) Stable handlers in effect dependencies

```tsx
import { useEffect } from 'react';
import { useBoolean } from '@webeach/react-hooks/useBoolean';

export function LiveSubscription() {
  const { value: enabled, setTrue, setFalse } = useBoolean(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'e') setTrue();
      if (e.key === 'd') setFalse();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTrue, setFalse]); // they are stable, so deps are optional

  return <div>Enabled: {String(enabled)}</div>;
}
```

---

## Behavior

1. **Simple state model**
   - Stores a single boolean value (via `useState`).
2. **Memoized actions**
   - `setTrue` and `setFalse` are memoized with `useCallback` and remain stable across renders.
3. **Hybrid structure**
   - Returned value is built via `useDemandStructure`, so you can use tuple or object destructuring without extra calculations.
4. **No global side effects**
   - The hook doesn’t rely on global objects (safe for SSR/ISR) and only triggers re-renders when the boolean value changes.

---

## When to use

- UI toggles: opening/closing modals, dropdowns, or sidebars.
- Simple state flags: “loading”, “active”, “enabled”, “confirmed”, etc.
- When you want a **minimal API** with clear `setTrue`/`setFalse` actions and flexible destructuring.

---

## When **not** to use

- For **complex state transitions** (multiple flags, dependent conditions) — prefer `useReducer` or a custom hook.
- When you need more than just `true/false` (e.g., `on/off/indeterminate`) — use `useState` with enums or a dedicated hook.

---

## Common mistakes

1. **Using only tuple destructuring when object form improves clarity**
   - In complex components, `[value, setTrue, setFalse]` can be unclear — prefer `{ value, setTrue, setFalse }`.

2. **Mixing tuple and object in the same component**
   - Stick to one style per component to keep the code consistent.

3. **Expecting a `toggle` function**
   - The hook only provides `setTrue` and `setFalse`. If you need a toggle, use `useToggle` instead.

---

## Typing

**Exported types**

- `UseBooleanReturn`
   - Hybrid: tuple `[boolean, () => void, () => void]` **and** object `{ value: boolean; setTrue: () => void; setFalse: () => void }`.

- `UseBooleanReturnObject`
   - Object form: `{ value: boolean; setTrue: () => void; setFalse: () => void }`.

- `UseBooleanReturnTuple`
   - Tuple form: `[boolean, () => void, () => void]`.

---

## See also

- [useControlled](useControlled.md)
- [useNumber](useNumber.md)
- [useToggle](useToggle.md)
