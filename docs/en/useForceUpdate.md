# `useForceUpdate`

## Description

`useForceUpdate` is a hook that returns a function to **force a component re-render**. Optionally, you can provide a callback that will be executed **before** the re-render is scheduled.

---

## Signature

```ts
function useForceUpdate(): (onBeforeUpdate?: () => void) => void;
```

- **Returns**
   - A function `forceUpdate(onBeforeUpdate?)` that triggers a re-render. If `onBeforeUpdate` is provided, it is called synchronously **before** the re-render is scheduled.

---

## Examples

### 1) Forcing an update after an imperative mutation

```tsx
import { useRef } from 'react';
import { useForceUpdate } from '@webeach/react-hooks/useForceUpdate';

export function RefCounter() {
  const forceUpdate = useForceUpdate();
  const countRef = useRef(0);

  const increment = () => {
    countRef.current += 1; // imperative mutation outside React state
    forceUpdate();         // trigger re-render to show the new value
  };

  return (
    <button onClick={increment}>
      count = {countRef.current}
    </button>
  );
}
```

### 2) Using a callback before the update (logging/cleanup/sync)

```tsx
import { useForceUpdate } from '@webeach/react-hooks/useForceUpdate';

export function WithCallback() {
  const forceUpdate = useForceUpdate();

  const handleClick = () => {
    forceUpdate(() => {
      console.log('Before re-render');
    });
  };

  return <button onClick={handleClick}>Refresh</button>;
}
```

---

## Behavior

1. **Stable reference**
   - The returned function is stable across renders; safe to use in effect or callback dependencies.

2. **`onBeforeUpdate` execution**
   - If provided, `onBeforeUpdate` is called synchronously **before** scheduling a re-render.

3. **Batched updates**
   - Multiple calls within the same tick may be batched by React into a single re-render.

4. **Use case**
   - Ideal for syncing UI with external imperative changes that React state does not track.

---

## When to use

- Integrating with **imperative or external APIs** (editors, maps, widgets) where internal changes are not tracked by React.
- Rare cases where moving state into React is impossible or too complex.

## When **not** to use

- If you can manage state with `useState`, `useReducer`, or Context — prefer those.
- For external stores or event emitters, consider `useSyncExternalStore` or a subscription-based approach instead of forcing updates.

---

## Common mistakes

1. **Passing `forceUpdate` directly as an event handler**
   - Using `onClick={forceUpdate}` will pass the event object as `onBeforeUpdate` and attempt to call it as a function, causing an error. Use a wrapper: `onClick={() => forceUpdate()}` or pass a valid callback: `onClick={() => forceUpdate(() => {/* ... */})}`.

2. **Infinite render loops from effects**
   - Calling `forceUpdate()` inside an effect without conditions leads to continuous re-renders. Always add guards or dependencies.

3. **Expecting `onBeforeUpdate` to run after render**
   - The callback runs **before** re-render. For post-render logic, use `useEffect` or `useLayoutEffect`.

---

## Typing

**Exported types**

- `UseForceUpdateReturn`
   - Function signature: `(onBeforeUpdate?: () => void) => void`.

---

## See also

- [useRefState](useRefState.md)
- [useDemandStructure](useDemandStructure.md)
- [useUpdateEffect](useUpdateEffect.md)
