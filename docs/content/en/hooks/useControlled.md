# `useControlled`

## Description

`useControlled` is a hook for managing a value in two modes: **controlled** (driven by an external `value`) and **uncontrolled** (using internal state seeded from `defaultValue`).

The result is a _hybrid_ structure that supports both **tuple** and **object** destructuring:

- Tuple: `[value, setValue, isControlled]`
- Object: `{ value, setValue, isControlled }`

`setValue` accepts either a plain value or an updater function `(prev) => next`, just like React's `useState` setter.

---

## Signature

```ts
function useControlled<ValueType>(
  defaultValue: ValueType | (() => ValueType),
  value?: NoInfer<ValueType>,
): UseControlledReturn<ValueType>;
```

- **Parameters**
  - `defaultValue` — initial value for the **uncontrolled** mode. Can also be a lazy initializer function (`() => ValueType`).
  - `value` — the optional **controlled** value. If `value !== undefined`, the hook works in controlled mode.

- **Returns**: `UseControlledReturn<ValueType>` — a hybrid structure:
  - `value: ValueType` — current value (controlled or internal).
  - `setValue(nextValue): void` — updates the value **only** in uncontrolled mode (no-op in controlled mode). Accepts either a value or an updater `(prev) => next`.
  - `isControlled: boolean` — indicates whether the hook is currently in controlled mode.

### Type inference

`ValueType` is inferred **only** from `defaultValue`:

- `useControlled('default', value)` → `ValueType = string`, `value: string`
- `useControlled(0, value)` → `ValueType = number`, `value: number`
- `useControlled<string | undefined>(undefined, value)` → `ValueType = string | undefined`, `value: string | undefined`

If you want a fully optional value (no default), you must opt in explicitly via the generic parameter.

---

## Examples

### 1) `<Toggle>` component

```tsx
import { useControlled } from '@webeach/react-hooks';

export type ToggleProps = {
  value?: boolean; // if undefined → uncontrolled mode
  defaultValue?: boolean; // used only in uncontrolled mode
  onChange?: (next: boolean) => void;
};

export function Toggle(props: ToggleProps) {
  const { value, defaultValue = false, onChange } = props;

  const state = useControlled(defaultValue, value);

  const handleClick = () => {
    const next = !state.value;
    state.setValue(next);
    onChange?.(next);
  };

  return (
    <button aria-pressed={state.value} onClick={handleClick}>
      {state.value ? 'On' : 'Off'}
    </button>
  );
}
```

### 2) Counter with functional updates

```tsx
import { useControlled } from '@webeach/react-hooks';

export function Counter({ value }: { value?: number }) {
  const [count, setCount] = useControlled(0, value);

  return (
    <div>
      <button onClick={() => setCount((prev) => prev - 1)}>−</button>
      <span>{count}</span>
      <button onClick={() => setCount((prev) => prev + 1)}>+</button>
    </div>
  );
}
```

### 3) `<Modal>` with `defaultVisible` and `visible`

```tsx
import { type ReactNode, useState } from 'react';
import { useControlled } from '@webeach/react-hooks';

export type ModalProps = {
  visible?: boolean; // controlled mode if defined
  defaultVisible?: boolean; // initial value for uncontrolled mode
  onVisibleChange?: (v: boolean) => void;
  title?: string;
  children?: ReactNode;
};

export function Modal(props: ModalProps) {
  const { children, visible, defaultVisible = false, onVisibleChange } = props;

  const visibilityState = useControlled(defaultVisible, visible);

  const setVisible = (next: boolean) => {
    visibilityState.setValue(next); // no-op in controlled mode, still calls onVisibleChange
    onVisibleChange?.(next);
  };

  if (!visibilityState.value) {
    return null;
  }

  return (
    <div role="dialog" aria-modal="true" className="backdrop">
      <div className="modal">
        <header className="modal__header">
          <h2 className="modal__title">{props.title}</h2>
          <button aria-label="Close" onClick={() => setVisible(false)}>
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

// Usage:
// 1) Uncontrolled mode
// <Modal defaultVisible={false} onVisibleChange={(open) => console.log(open)} title="Hello" />
//
// 2) Controlled mode
// function Page() {
//   const [open, setOpen] = useState(false);
//   return (
//     <>
//       <button onClick={() => setOpen(true)}>Open</button>
//       <Modal visible={open} onVisibleChange={setOpen} title="Hello">content</Modal>
//     </>
//   );
// }
```

---

## Behavior

1. **Mode detection**
   - The hook is in controlled mode if `value !== undefined`. A `null` value is still treated as controlled.

2. **Current value resolution**
   - In controlled mode, `value` comes directly from the prop.
   - In uncontrolled mode, the hook manages its own internal state, initialized from `defaultValue` (lazy initialization supported).

3. **`setValue` behavior**
   - In uncontrolled mode: updates the internal state. Accepts either a value or an updater `(prev) => next`.
   - In controlled mode: becomes a **no-op** — it doesn't trigger a re-render. You may still call it safely; combine with the parent's `onChange` to propagate the value upward.

4. **Mode switching**
   - When switching from controlled → uncontrolled after mount, the last controlled value is preserved as the initial uncontrolled state. Works correctly for falsy values like `0`, `''`, `false`.
   - Safe under React `<StrictMode>`: the restore branch only runs on a true controlled → uncontrolled transition, not on the dev-mode double-mount.

5. **Hybrid return structure**
   - Works with both tuple and object destructuring: `[value, setValue, isControlled]` or `{ value, setValue, isControlled }`.

---

## When to use

- Building input components that must support both **controlled** and **uncontrolled** usage.
- Scenarios where you need flexibility: local state for simple use, external state for complex forms.
- Migration paths from uncontrolled to controlled components.

---

## When **not** to use

- If the component should **always be controlled** — use plain `useState` and pass `value`/`onChange` externally.
- If you need advanced state transitions — prefer `useReducer` or a custom state manager.

---

## Common mistakes

1. **Assuming `setValue` triggers updates in controlled mode**
   - In controlled mode, `setValue` is a no-op. Propagate changes via the parent's `onChange`.

2. **Confusing `null` vs `undefined`**
   - Passing `null` means _controlled_ mode with `null` value. To use uncontrolled mode, pass `undefined`.

3. **Expecting `value` to be `T | undefined` when `defaultValue` is provided**
   - With a `defaultValue`, the returned `value` type is `ValueType` (always defined). To allow `undefined`, opt in via the generic: `useControlled<string | undefined>(undefined, controlled)`.

4. **Forgetting lazy initialization**
   - If computing the initial value is expensive, wrap it in a function: `useControlled(() => expensiveInit(), value)`.

---

## Typing

**Exported types**

- `UseControlledReturn<ValueType>`
  - Hybrid: tuple `[value: ValueType, setValue, isControlled: boolean]` **and** object `{ value: ValueType; setValue; isControlled: boolean }`.

- `UseControlledReturnObject<ValueType>`
  - Object form: `{ value: ValueType; setValue: (next: ValueType | ((prev: ValueType) => ValueType)) => void; isControlled: boolean }`.

- `UseControlledReturnTuple<ValueType>`
  - Tuple form: `[value: ValueType, setValue: (next: ValueType | ((prev: ValueType) => ValueType)) => void, isControlled: boolean]`.

---

## See also

- [useBoolean](useBoolean.md)
- [useNumber](useNumber.md)
- [useToggle](useToggle.md)
