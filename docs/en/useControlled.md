# `useControlled`

## Description

`useControlled` is a hook for managing a value in two modes: **controlled** (driven by an external `value`) and **uncontrolled** (using internal state initialized with `defaultValue`).
The hook returns a *hybrid* structure that supports both **tuple** and **object** destructuring:

- Tuple: `[value, setValue, isControlled]`
- Object: `{ value, setValue, isControlled }`

---

## Signature

```ts
function useControlled<ValueType>(
  defaultValue: ValueType | (() => ValueType) | undefined,
  value: ValueType | undefined,
): UseControlledReturn<ValueType>;
```

- **Parameters**
   - `defaultValue` — initial value for the **uncontrolled** mode. Can also be a lazy initializer function.
   - `value` — the **controlled** value. If `value !== undefined`, the hook works in controlled mode.

- **Returns**: `UseControlledReturn<ValueType>` — a hybrid structure:
   - `value: ValueType | undefined` — current value (external or internal).
   - `setValue(nextValue: ValueType): void` — updates the value **only** in uncontrolled mode (no-op in controlled mode).
   - `isControlled: boolean` — indicates whether the hook is currently in controlled mode.

---

## Examples

### 1) `<Toggle>` component

```tsx
import { useControlled } from '@webeach/react-hooks/useControlled';

export type ToggleProps = {
  value?: boolean; // if undefined → uncontrolled mode
  defaultValue?: boolean; // used only in uncontrolled mode
  onChange?: (next: boolean) => void;
};

export function Toggle(props: ToggleProps) {
  const { value, defaultValue, onChange } = props;

  const state = useControlled<boolean>(defaultValue, value);

  const handleClick = () => {
    state.setValue(!state.value);
    onChange?.(!state.value);
  };

  return (
    <button aria-pressed={Boolean(state.value)} onClick={handleClick}>
      {state.value ? 'On' : 'Off'}
    </button>
  );
}
```

### 2) `<Modal>` with `defaultVisible` and `visible`

```tsx
import { type ReactNode, useState } from 'react';
import { useControlled } from '@webeach/react-hooks/useControlled';

export type ModalProps = {
  visible?: boolean;           // controlled mode if defined
  defaultVisible?: boolean;    // initial value for uncontrolled mode
  onVisibleChange?: (v: boolean) => void;
  title?: string;
  children?: ReactNode;
};

export function Modal(props: ModalProps) {
  const { children, visible, defaultVisible, onVisibleChange } = props;

  const visibilityState = useControlled<boolean>(defaultVisible, visible);

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
          <button aria-label="Close" onClick={() => setVisible(false)}>×</button>
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
   - In uncontrolled mode: updates the internal state.
   - In controlled mode: becomes a **no-op** (does not change state). However, you may still call it safely to trigger `onChange` externally.

4. **Mode switching**
   - When switching from controlled → uncontrolled after mount, the last controlled value is preserved as the initial uncontrolled state.

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

1. **Assuming `setValue` works in controlled mode**
   - In controlled mode, `setValue` is ignored. You must use the parent’s `onChange` to update the value.

2. **Confusing `null` vs `undefined`**
   - Passing `null` means *controlled* mode with `null` value. To use uncontrolled mode, pass `undefined`.

3. **Switching modes too often**
   - Rapidly toggling between controlled/uncontrolled can complicate state management. It’s better to stick to one mode during a component’s lifecycle.

4. **Forgetting lazy initialization**
   - If computing the initial value is expensive, wrap it in a function: `useControlled(() => expensiveInit(), undefined)`.

---

## Typing

**Exported types**

- `UseControlledReturn<ValueType>`
   - Hybrid: tuple `[value: ValueType | undefined, setValue: (next: ValueType) => void, isControlled: boolean]` **and** object `{ value: ValueType | undefined; setValue: (next: ValueType) => void; isControlled: boolean }`.

- `UseControlledReturnObject<ValueType>`
   - Object form: `{ value: ValueType | undefined; setValue: (next: ValueType) => void; isControlled: boolean }`.

- `UseControlledReturnTuple<ValueType>`
   - Tuple form: `[value: ValueType | undefined, setValue: (next: ValueType) => void, isControlled: boolean]`.

---

## See also

- [useBoolean](useBoolean.md)
- [useNumber](useNumber.md)
- [useToggle](useToggle.md)
