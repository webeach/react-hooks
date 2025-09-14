# `useCallbackCompare`

## Description

`useCallbackCompare` is a wrapper around `useCallback` that returns a **memoized callback**, which only updates when its dependencies **logically change**. It supports three forms:

- An array of dependencies with **shallow comparison** by index (`===`).
- A **custom comparison function** with a separate value.
- **Only a comparison function**, if the comparison logic is fully encapsulated inside it.

---

## Signature

```ts
// 1) Dependency array
function useCallbackCompare<CallbackType extends (...args: any) => any>(
  callback: CallbackType,
  deps: unknown[],
): CallbackType;

// 2) Custom comparator + value
function useCallbackCompare<
  CallbackType extends (...args: any) => any,
  ComparedValue,
>(
  callback: CallbackType,
  compare: UseCallbackCompareFunction<ComparedValue>,
  comparedValue: ComparedValue,
): CallbackType;

// 3) Comparator only
function useCallbackCompare<CallbackType extends (...args: any) => any>(
  callback: CallbackType,
  compare: UseCallbackCompareFunction,
): CallbackType;
```

- **Parameters**
   - `callback` — the function to be memoized.
   - `deps` — an array of dependencies; compared **shallowly** by index (`===`).
   - `compare` — a comparison function that should return `true` if values are **equal** (no change), and `false` if they **differ** (change detected).
   - `comparedValue` — a value passed into the custom comparator for comparison.

- **Returns**
   - A memoized callback of the same type as `callback`.

---

## Examples

### 1) Dependency array: stable handler

```tsx
import { useCallbackCompare } from '@webeach/react-hooks/useCallbackCompare';

function AddToCart({ productId, qty }: { productId: string; qty: number }) {
  const handleClick = useCallbackCompare(() => {
    add(productId, qty);
  }, [productId, qty]);

  return <button onClick={handleClick}>Add</button>;
}
```

### 2) Custom comparator by entity key

```tsx
import { useCallbackCompare } from '@webeach/react-hooks/useCallbackCompare';

function SaveButton({ user }: { user: { id: string; name: string } }) {
  const onSave = useCallbackCompare(
    () => updateUser(user),
    (prev, next) => prev?.id === next?.id, // only recreate if id changes
    user,
  );

  return <button onClick={onSave}>Save</button>;
}
```

### 3) Comparator only: logic inside the function

```tsx
import { useCallbackCompare } from '@webeach/react-hooks/useCallbackCompare';

// Compare by config version stored in closure
function ApplyTheme({ config }: { config: ThemeConfig }) {
  const apply = useCallbackCompare(
    () => applyTheme(config),
    () => config.version === lastAppliedVersion.current,
  );

  return <button onClick={apply}>Apply theme</button>;
}
```

---

## Behavior

1. **Update trigger**
   - The callback is recreated only when a **detected change** occurs in dependencies. Otherwise, the reference remains stable.

2. **Dynamic dependency arrays**
   - In the `deps` form, the array may be **dynamic**: its length and order can change between renders. Comparison checks both length and values at each index. Unlike standard `useCallback`, you don’t need to maintain the exact array shape between renders.

3. **Comparator semantics**
   - The comparator must return `true` if values are **equal** (no change) and `false` if they **differ** (change detected). This result controls whether the callback is recreated.

4. **Stable reference**
   - If no change is detected, the **same function reference** is preserved. Useful for `React.memo`, effect dependencies, and child props.

---

## When to use

- Passing callbacks to `React.memo` components without unnecessary re-renders.
- When only **logical changes** in dependencies should trigger updates (e.g., comparing by `id`).
- Integration scenarios requiring a **stable callback reference** (e.g., virtualization, event bus, external libraries).

---

## When **not** to use

- When plain `useCallback` with a dependency array is sufficient.
- When it’s simpler to store values in state/refs and read them inside a stable callback.
- If the callback itself is expensive — optimize the callback, not just its dependencies.

---

## Common mistakes

1. **Reversed comparator logic**
   - The comparator should return `true` if values are considered equal. Returning the opposite will cause extra or missing updates.

2. **Stale closures**
   - If the callback uses values that are **not included** in `deps`/`comparedValue`/`compare`, it may capture stale data. Ensure relevant values are part of the comparison.

3. **Unstable `comparedValue`**
   - Avoid passing objects/functions that change identity each render without meaningful change. Otherwise, the callback will be recreated too often.

---

## Typing

**Exported types**

- `UseCallbackCompareFunction<ValueType>`
   - With `ValueType`: `(prev: ValueType, next: ValueType) => boolean` (return `true` if equal).
   - Without `ValueType`: `() => boolean` (all comparison logic handled inside).

---

## See also

- [useDebounceCallback](useDebounceCallback.md)
- [useDeps](useDeps.md)
- [useEffectCompare](useEffectCompare.md)
- [useMemoCompare](useMemoCompare.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
- [useThrottleCallback](useThrottleCallback.md)
