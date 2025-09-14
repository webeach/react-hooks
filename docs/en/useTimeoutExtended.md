# `useTimeoutExtended`

## Description

`useTimeoutExtended` provides a fully **controlled one‑shot timer** with control methods (`start`, `restart`, `cancel`) and state flags (`isPending`, `isDone`).

The timer **never starts automatically** — you must start it manually.

If you need a simple, auto‑started one‑off timer, use `useTimeout` instead.

---

## Signature

```ts
// Variant 1: with a default delay
function useTimeoutExtended(
  callback: UseTimeoutExtendedCallback,
  delayMs: number,
): UseTimeoutExtendedReturn;

// Variant 2: without a default delay (start requires an argument)
function useTimeoutExtended(
  callback: UseTimeoutExtendedCallback,
): UseTimeoutExtendedReturn<true>;
```

- **Parameters**
   - `callback` — function invoked when the timer completes. Receives the **actual elapsed time** (ms).
   - `delayMs` *(optional)* — default timer duration. Used when starting **without** an override value.

- **Returns**
   - A control object with methods and state:
      - **Methods**
         - `start(overrideDelayMs?)` — starts or restarts the timer. If an argument is provided, that duration is used and subsequent changes to `delayMs` are **ignored** for this run.
         - `restart(overrideDelayMs?)` — alias of `start` for readability.
         - `cancel()` — cancels the active timer.
      - **State**
         - `isPending` — the timer is active.
         - `isDone` — the timer has finished.

---

## Behavior

1. The hook does **not** start a timer automatically.
2. When calling `start()` / `restart()`:
   - If `overrideDelayMs` is passed, that duration is used and future changes to `delayMs` have **no effect** on the current run.
   - If no argument is passed, the current `delayMs` is used, and when `delayMs` changes while the timer is active, the remaining time is **recalculated** so that the total runtime matches the **new** value.
3. `cancel()` resets the state and prevents the callback from firing.
4. On unmount, any active timer is cleared automatically.

---

## Examples

### 1) With a default delay

```tsx
import { useTimeoutExtended } from '@webeach/react-hooks/useTimeoutExtended';

function Example() {
  const { start, cancel, isPending, isDone } = useTimeoutExtended((elapsed) => {
    console.log(`Elapsed ${elapsed} ms`);
  }, 1000);

  return (
    <div>
      <button onClick={() => start()}>Start (1s)</button>
      <button onClick={() => start(2000)}>Start with override (2s)</button>
      <button onClick={cancel}>Cancel</button>
      <p>
        {isPending && 'Timer is running…'}
        {isDone && 'Done!'}
      </p>
    </div>
  );
}
```

### 2) Without a default delay

```tsx
import { useTimeoutExtended } from '@webeach/react-hooks/useTimeoutExtended';

function Example() {
  const { start } = useTimeoutExtended((elapsed) => {
    alert(`Timer finished in ${elapsed} ms`);
  });

  return <button onClick={() => start(500)}>Start for 500 ms</button>;
}
```

---

## When to Use

- You need **full control** over starting, restarting, and canceling a timer.
- You need to reflect **on‑the‑fly changes** to `delayMs` by recalculating the remaining time.
- You care about distinguishing `isPending` vs `isDone`.

---

## When **Not** to Use

- For a simple "fire‑and‑forget" delay — use `useTimeout`.
- For **periodic** execution — use `useLoop`.
- For running multiple timers simultaneously — consider a custom manager/pool.

---

## Common Mistakes

- Expecting the timer to auto‑start — you must call `start()` yourself.
- Changing `delayMs` has **no effect** on a timer started with an `overrideDelayMs` argument.
- `isDone` and `isPending` update only when they are actually read by the component (lazy updates).

---

## Typing

- **Exported types**
   - `UseTimeoutExtendedCallback` — `(actualTime: number) => void`.
   - `UseTimeoutExtendedReturn<RequiredMsArg = false>` — control object. When `RequiredMsArg` is `true`, `start(ms: number)` requires the delay argument.

---

## See Also

- [useFrame](useFrame.md)
- [useFrameExtended](useFrameExtended.md)
- [useLoop](useLoop.md)
- [useTimeout](useTimeout.md)
