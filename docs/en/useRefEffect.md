# `useRefEffect`

## Description

`useRefEffect` is a hook that **runs a handler when `ref.current` becomes non‑null** (a DOM element/instance appears) and re‑invokes it when the **reference changes** or when the provided dependencies/compared value indicate a change. The handler may return a cleanup function — it will be called on element change or unmount.

The hook uses dependency comparison via `useDeps`, so it supports **dynamic dependency arrays** (no fixed length required) as well as a **custom comparator function**.

---

## Signature

```ts
// 1) Only ref
function useRefEffect<RefValue>(
  ref: React.RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
): void;

// 2) ref + dependencies array (shallow `===`, dynamic length allowed)
function useRefEffect<RefValue>(
  ref: React.RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  deps: unknown[],
): void;

// 3) ref + compare(prev, next) + comparedValue
function useRefEffect<RefValue, ComparedValue>(
  ref: React.RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  compare: (prev: ComparedValue, next: ComparedValue) => boolean,
  comparedValue: ComparedValue,
): void;

// 4) ref + compare() (you control comparison entirely inside the function)
function useRefEffect<RefValue>(
  ref: React.RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  compare: () => boolean,
): void;
```

- **Parameters**
   - `ref` — the observed `ref`; the handler runs when `ref.current` becomes non‑`null/undefined`.
   - `handler(current)` — function that receives the current `ref.current`; may return `cleanup`.
   - `deps` | `compare` | `comparedValue` — optional triggers to re‑run the handler.

- **Returns**: `void`.

---

## Examples

### 1) Focus input when it appears

```tsx
import { useRef } from 'react';
import { useRefEffect } from '@webeach/react-hooks/useRefEffect';

export function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useRefEffect(inputRef, (element) => {
    element.focus();
  });

  return <input ref={inputRef} />;
}
```

### 2) Re‑run when dependencies change

```tsx
import { useRef } from 'react';
import { useRefEffect } from '@webeach/react-hooks/useRefEffect';

type ThemeBoxProps = {
  theme: 'light' | 'dark';
};

export function ThemedBox(props: ThemeBoxProps) {
  const { theme } = props;
  const boxRef = useRef<HTMLDivElement>(null);

  useRefEffect(
    boxRef,
    (element) => {
      element.dataset.theme = theme;
      return () => {
        delete element.dataset.theme;
      };
    },
    [theme],
  );

  return <div ref={boxRef} />;
}
```

### 3) Custom comparison: react only to `user.id` changes

```tsx
import { useRef } from 'react';
import { useRefEffect } from '@webeach/react-hooks/useRefEffect';

type User = { id: string; name: string };

type UserBadgeProps = { user: User };

export function UserBadge(props: UserBadgeProps) {
  const { user } = props;
  const ref = useRef<HTMLDivElement>(null);

  useRefEffect(
    ref,
    (element) => {
      element.textContent = `User: ${user.name}`;
    },
    (prev, next) => prev.id === next.id,
    user,
  );

  return <div ref={ref} />;
}
```

---

## Behavior

1. **Run triggers**
   - On mount, the handler runs **immediately** if `ref.current` is already non‑`null/undefined`.
   - Afterwards, the handler re‑runs on **reference changes** in `ref.current` or when the provided triggers (`deps` / `compare`) detect a change.

2. **Cleanup**
   - If the handler returns `cleanup`, it is called **before** the next handler run and on unmount.

3. **Dynamic dependencies**
   - With `deps: unknown[]`, comparison is index‑by‑index (`===`) and **does not require a fixed length** — the array may change between renders.

4. **Custom comparison**
   - Instead of `deps`, pass `compare(prev, next)` and `comparedValue`. The handler restarts when `compare(prev, next)` returns `false`.
   - In the advanced form, pass only `compare()` and fully control the condition inside the function.

5. **Handler freshness**
   - The hook reads the **latest** version of `handler` through a live ref, so you don’t need to wrap it in `useCallback` or add it to dependency lists.

6. **Same element behavior**
   - Writing the **same object** back into `ref.current` does not restart the handler. Use `deps`/`compare` to force a restart.

7. **Scheduling**
   - Changes to `ref.current` are processed via `requestAnimationFrame`, helping to avoid extra layout thrashing. The initial run on mount is synchronous.

8. **SSR‑safe**
   - Uses an isomorphic layout effect; there are no side effects on the server.

---

## When to Use

- Subscriptions/initialization tied to a **specific DOM node**: focus, `ResizeObserver`/`IntersectionObserver`, third‑party widgets, positioning.
- Imperative work that must run whenever the **element inside the ref changes**.
- Precise restarts based on a **custom condition** via `compare`.

---

## When **Not** to Use

- When you just need to react to **value changes** without a `ref` — use `useEffect`/`useEffectCompare`.
- When you require a synchronous call on **every** assignment to `ref.current` with no frame scheduling — write a custom wrapper (after the initial mount, changes are processed via `requestAnimationFrame`).

---

## Common Mistakes

1. **Expecting a call when `null`**
   - The handler is **not** called when `ref.current` becomes `null/undefined`; only `cleanup` runs then.

2. **Expecting a restart on writing the same element**
   - No restart occurs; use `deps`/`compare` if you need to force it.

3. **Complex dynamic `deps` without understanding comparison**
   - Remember: comparison is index‑based and uses `===`. For finer control, use the comparator form.

---

## Typing

**Exported types**

- `UseRefEffectHandler<RefValue>`
   - Effect handler for the ref value: `(current: RefValue) => void | (() => void)`.
   - May return a cleanup function, same as in `useEffect`.

---

## See Also

- [useEffectCompare](useEffectCompare.md)
- [useIsomorphicLayoutEffect](useIsomorphicLayoutEffect.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
- [useRefEffect](useRefEffect.md)
- [useUnmount](useUnmount.md)
