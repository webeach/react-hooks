# `useThrottleState`

## Description

`useThrottleState` provides state with a **throttled setter** (leading + trailing).

- First call after a quiet period updates the state **immediately** (**leading**).
- Subsequent calls **within the `delayMs` window** are **coalesced** into a single update at the end of the window with the **latest** value (**trailing**).
- The setter reference is **stable** between renders (convenient for deps and event subscriptions).
- Any pending trailing update is **cleared** on unmount.
- Changing `delayMs` **does not affect** an already scheduled trailing update; the new interval applies to **subsequent** setter calls.

---

## Signature

```ts
// Variant 1: delay only, initial state is undefined
function useThrottleState<State = undefined>(
  delayMs: number,
): UseThrottleStateReturn<State | undefined>;

// Variant 2: explicit initial value
function useThrottleState<State>(
  initialState: State | (() => State),
  delayMs: number,
): UseThrottleStateReturn<State>;
```

**Parameters**
- `initialState` — initial value or lazy initializer (optional).
- `delayMs` — throttling window in milliseconds.

**Returns**
- Tuple `[state, setThrottleState]`:
   - `state` — current value;
   - `setThrottleState(next)` — throttled setter (stable reference), accepts a value **or** a functional updater.

---

## Examples

### 1) Input field with “fast first” and finalization
```tsx
import { useThrottleState } from '@webeach/react-hooks/useThrottleState';

export function SearchBox() {
  const [query, setQuery] = useThrottleState('', 300);
  return (
    <input
      value={query ?? ''}
      onChange={(e) => setQuery(e.currentTarget.value)}
      placeholder="Search…"
    />
  );
}
```

### 2) High-frequency events (resize/scroll/drag)
```tsx
const [pos, setPos] = useThrottleState({ x: 0, y: 0 }, 100);

useEffect(() => {
  const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
  window.addEventListener('mousemove', onMove);
  return () => window.removeEventListener('mousemove', onMove);
}, []);
```

### 3) Functional updates
```tsx
const [count, setCount] = useThrottleState(0, 250);

// The first click after idle applies +1 immediately,
// subsequent clicks within the window collapse into one final +1
<button onClick={() => setCount((x) => x + 1)}>+1 (throttled)</button>
```

### 4) Adjustable interval
```tsx
const [delay, setDelay] = useState(300);
const [text, setText] = useThrottleState('', delay);
// The new delay takes effect on the next setText call
```

---

## Behavior (brief)

1. **Leading + trailing**: first write is immediate; the last write within the window fires at the end of the window.
2. **Coalescing**: calls within the window are merged; the **latest** value/updater wins.
3. **Functional updaters** are supported; the **last** updater provided within the window is used.
4. **Stable setter**: `setThrottleState` identity does not change between renders.
5. **Unmount-safe**: pending updates are cleared on unmount.
6. **Changing `delayMs`**: does not affect an already scheduled update.

---

## When to Use

- High-frequency sources: `mousemove`, `scroll`, `resize`, drag, input streams.
- You want a **quick first response** and a single finalization with the "latest at the end" value.
- Limiting the frequency of expensive recalculations/requests without losing responsiveness.

## When **Not** to Use

- You want “only the last after a pause” — use `useDebounceState`.
- You need a strict periodic schedule — use a timer/loop.
- You need a mode without trailing or a different combination — use low-level `useThrottleCallback`.

---

## Typing

**Exported types**

- `UseThrottleStateSetAction<State>`
   - Direct value: `State`.
   - Or functional updater: `(prev: State) => State`.

- `UseThrottleStateDispatch<State>`
   - Throttled state setter: `(action: UseThrottleStateSetAction<State>) => void`.

- `UseThrottleStateReturn<State>`
   - Tuple: `[state: State, setThrottleState: UseThrottleStateDispatch<State>]`.

---

## See Also

- [useCallbackCompare](useCallbackCompare.md)
- [useDebounceCallback](useDebounceCallback.md)
- [useDebounceState](useDebounceState.md)
- [useThrottleCallback](useThrottleCallback.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
