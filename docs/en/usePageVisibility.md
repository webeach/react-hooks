# `usePageVisibility`

## Description

`usePageVisibility` tracks the **page visibility** state (`visible`/`hidden`) via the `visibilitychange` event. It returns a *hybrid* structure with the current `isVisible` flag and (optionally) invokes a callback on every visibility change.

- Tuple: `[isVisible]`
- Object: `{ isVisible }`

---

## Signature

```ts
function usePageVisibility(
  callback?: UsePageVisibilityCallback,
): UsePageVisibilityReturn;
```

- **Parameters**
   - `callback?` — a function called on each visibility change: `(isVisible: boolean) => void`.

- **Returns**: `UsePageVisibilityReturn` — a hybrid structure with `isVisible: boolean` as property/tuple element.

---

## Examples

### 1) Show a tab activity badge

```tsx
import { usePageVisibility } from '@webeach/react-hooks/usePageVisibility';

export function PageActivityBadge() {
  const { isVisible } = usePageVisibility();

  return <div>{isVisible ? '🟢 Tab is active' : '⚪️ Tab is inactive'}</div>;
}
```

### 2) Pause/resume animation (via a CSS class)

```tsx
import { usePageVisibility } from '@webeach/react-hooks/usePageVisibility';

export function Spinner() {
  const { isVisible } = usePageVisibility();

  return <div className={isVisible ? 'spinner' : 'spinner spinner--paused'} />;
}
```

---

## Behavior

1. **`isVisible` semantics**
   - Reflects `document.visibilityState === 'visible'` and updates on the `visibilitychange` event.

2. **Optional callback**
   - On every change, `callback?.(isVisible)` is called. The callback always fires even if the component doesn’t read `isVisible` in the UI.

3. **Updates only when used**
   - If `isVisible` isn’t read (e.g., you only rely on the callback), an extra re-render is **not** triggered.

4. **SSR/ISR safety**
   - On the server, `isVisible` is considered `true`; the event subscription is attached only after mount. Right after hydration, the real value may arrive and cause an update.

5. **Stable interface**
   - The returned structure consistently exposes only `isVisible`; convenient for both tuple and object destructuring.

---

## When to Use

- Pause polling/timers/animations on a hidden tab.
- Disable heavy computations and network requests while the user is away.
- Show "online/inactive" indicators or badges.

---

## When **Not** to Use

- If your logic doesn’t depend on tab visibility.
- If you need more detailed activity telemetry (window focus, `pointermove`, other events) — combine with dedicated hooks/events.

---

## Common Mistakes

1. **Expecting a re-render without reading `isVisible`**
   - If you don’t use `isVisible` in markup/logic, the component won’t re-render — use the callback for side effects.

2. **Heavy work inside the callback**
   - Avoid long-running work in the visibility handler; offload to deferred tasks/workers.

3. **Relying on the SSR initial value**
   - Remember that on the server `isVisible = true`; immediately after mount the value can change.

---

## Typing

**Exported types**

- `UsePageVisibilityCallback`
   - Callback invoked on document visibility changes: `(isVisible: boolean) => void`.

- `UsePageVisibilityReturn`
   - Hybrid type: tuple `[isVisible]` **and** object `{ isVisible }`.

- `UsePageVisibilityReturnObject`
   - Object form: `{ isVisible: boolean }`.

- `UsePageVisibilityReturnTuple`
   - Tuple form: `[isVisible: boolean]`.

---

## See Also

- [usePageTitle](usePageTitle.md)
