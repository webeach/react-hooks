# `useLayoutEffectCompare`

## Description

`useLayoutEffectCompare` is a wrapper around a layout‑effect that runs the effect **only when dependencies have “meaningful” changes**. It supports three comparison modes:

- a dependencies array with **shallow index‑by‑index comparison** (`===`),
- a **custom comparator function** plus a separate value,
- **comparator‑only**, when comparison logic is fully encapsulated inside the comparator.

The effect runs synchronously during the **layout** phase (before paint), so it’s suitable for DOM measurements and synchronous pre‑paint preparation.

---

## Signature

```ts
// 1) Dependencies array
function useLayoutEffectCompare(
  effect: () => void | (() => void),
  deps: unknown[],
): void;

// 2) Custom comparator + value
function useLayoutEffectCompare<ComparedValue>(
  effect: () => void | (() => void),
  compare: (prev: ComparedValue, next: ComparedValue) => boolean,
  comparedValue: ComparedValue,
): void;

// 3) Comparator only
function useLayoutEffectCompare(
  effect: () => void | (() => void),
  compare: () => boolean,
): void;
```

- **Parameters**
   - `effect` — the layout‑effect function; may return a cleanup function.
   - `deps` — a dependencies array; compared **shallowly** by index (`===`).
   - `compare` — a comparator function that must return `true` when values are **equal** (no change) and `false` when they **differ** (there is a change).
   - `comparedValue` — the value to be compared by the custom comparator.

- **Returns**
   - `void` — same as regular effects.

---

## Examples

### 1) Dynamic dependencies for synchronous measurements

```tsx
import { useLayoutEffectCompare } from '@webeach/react-hooks/useLayoutEffectCompare';

function Measure({ nodes }: { nodes: HTMLElement[] }) {
  useLayoutEffectCompare(() => {
    // Runs only on a real change of `nodes` (values/order/length)
    const bounds = nodes.map((el) => el.getBoundingClientRect());
    syncLayout(bounds);
  }, nodes);

  return null;
}
```

### 2) Custom comparator by the “meaning” of size

```tsx
import { useLayoutEffectCompare } from '@webeach/react-hooks/useLayoutEffectCompare';

type Size = { width: number; height: number } | null;

function ResizeConsumer({ size }: { size: Size }) {
  useLayoutEffectCompare(
    () => {
      applySize(size);
    },
    (prev, next) => prev?.width === next?.width && prev?.height === next?.height,
    size,
  );

  return null;
}
```

### 3) Comparator only (logic inside a closure)

```tsx
import { useLayoutEffectCompare } from '@webeach/react-hooks/useLayoutEffectCompare';

function GridRuler() {
  useLayoutEffectCompare(
    () => {
      drawRulers();
      return () => eraseRulers();
    },
    () => {
      return layoutCache.version === lastVersionRef.current;
    },
  );

  return null;
}
```

---

## Behavior

1. **Effect trigger**
   - The effect runs only on a **detected change** of dependencies. For an array, shallow index‑by‑index comparison is used; for a comparator, it must return `false` on change.

2. **Dynamic dependencies array**
   - In the `deps` form, the array can be fully **dynamic**: its length and order may change between renders. Comparison accounts for both values by index and length; a length change is also considered a change. Unlike the standard `useLayoutEffect`, there is **no requirement** to keep the array length strictly stable across renders.

3. **Layout semantics**
   - The effect runs synchronously before paint, which is convenient for DOM reads/writes and layout synchronization. Use responsibly: heavy work will delay paint.

4. **Cleanup**
   - The cleanup function returned from `effect` runs before the next effect execution and on unmount.

5. **Flexible call forms**
   - Choose between a dependencies array, a custom comparator with a separate value, or a comparator‑only form — whichever fits the task.

---

## When to Use

- Synchronous DOM measurements before paint: size calculations, positioning, scrolling.
- When you care about **semantic** changes of dependencies, not just reference changes.
- Complex dependency objects that require a comparator by “meaning”.

---

## When **Not** to Use

- If a regular `useEffect` (after paint) is sufficient and synchronicity isn’t required.
- If heavy computations in a layout‑effect would block rendering — move them after paint or optimize.

---

## Common Mistakes

1. **Inverted comparator logic**
   - The comparator must return `true` for equality and `false` for difference. Otherwise, the effect will re‑run unnecessarily or be skipped.

2. **Rebuilding the deps array every render**
   - If you construct a fresh array with new references each render, remember that changed order/length also counts as a change — the effect will re‑run.

3. **Overly heavy layout‑effect**
   - Layout‑effects run before paint; avoid long‑running operations inside them.

---

## See Also

- [useCallbackCompare](useCallbackCompare.md)
- [useDeps](useDeps.md)
- [useEffectCompare](useEffectCompare.md)
- [useIsomorphicLayoutEffect](useIsomorphicLayoutEffect.md)
- [useMemoCompare](useMemoCompare.md)
- [useRefEffect](useRefEffect.md)
- [useUnmount](useUnmount.md)
