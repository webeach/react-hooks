# `useIsomorphicLayoutEffect`

## Description

`useIsomorphicLayoutEffect` is a safe drop‑in replacement for `useLayoutEffect` that automatically **falls back to `useEffect` during SSR** (server‑side rendering).

- In the **browser**, it behaves exactly like `useLayoutEffect`.
- On the **server**, it uses `useEffect`, preventing the React warning: *"useLayoutEffect does nothing on the server"*.

---

## Signature

```ts
export const useIsomorphicLayoutEffect: typeof useLayoutEffect | typeof useEffect;
```

---

## Example

```tsx
import { useIsomorphicLayoutEffect } from '@webeach/react-hooks/useIsomorphicLayoutEffect';

function Component() {
  useIsomorphicLayoutEffect(() => {
    console.log('Runs layout effect only in the browser');
  }, []);

  return <div />;
}
```

---

## When to Use

- When building components that must work consistently **both in the browser and on the server**.
- To avoid React warnings during **server‑side rendering** while still performing synchronous DOM‑related work in the browser.

---

## When **Not** to Use

- In projects **without SSR** (you can use `useLayoutEffect` directly).
- When **plain `useEffect`** is sufficient and synchronous DOM work is not required.

---

## Common Mistakes

1. **Ignoring SSR warnings**
   - Using `useLayoutEffect` directly in code that runs on the server can trigger warnings in React. Use `useIsomorphicLayoutEffect` to silence them safely.

2. **Mixing it up with `useEffect`**
   - Choose `useIsomorphicLayoutEffect` when you need **layout‑phase** effects in the browser **and** safe behavior during SSR. Otherwise prefer `useEffect`.

---

## See Also

- [useLayoutEffectCompare](useLayoutEffectCompare.md)
