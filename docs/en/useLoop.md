# `useLoop`

## Description

`useLoop` is a hook for **periodic execution** built on one‑shot `setTimeout`s. It supports **pause/resume**, **manual** and **automatic** modes, uses `performance.now()` for accurate timing, and can **carry over or reset the remaining time** when resuming.

If you need a **single‑shot** timer with extended controls — see `useTimeoutExtended`. For a simple one‑off run — use `useTimeout`.

---

## Signature

```ts
// Overload 1: fixed duration
function useLoop(
  callback: UseLoopCallback,
  durationMs: number,
): UseLoopReturn;

// Overload 2: full configuration
function useLoop(
  callback: UseLoopCallback,
  options: UseLoopOptions,
): UseLoopReturn;
```

**Parameters**
- `callback` — called on each tick. Receives `{ actualTime, resume }`:
   - `actualTime` — the **actual elapsed time** (ms) for the current interval;
   - `resume()` — continue the loop (useful when `manual: true`).
- `durationMs` — interval duration in ms for the short overload.
- `options` — full configuration (see below).

**Returns**
- A control function `run()` — start or resume the loop with the current options.

> The return supports **tuple/object** forms (via `useDemandStructure`), but practically you use a **single `run()` function**.

---

## Options (`UseLoopOptions`)

```ts
{
  /** autostart on mount (default false) */
  autorun?: boolean;
  /** external pause/resume (default false) */
  disabled?: boolean;
  /** duration of a single interval (ms) */
  durationMs: number;
  /** manual mode: one tick then wait (default false) */
  manual?: boolean;
  /** on resume/when duration changes — reset leftover time? (default false) */
  resetElapsedOnResume?: boolean;
}
```

- **`manual: false`** — after each tick the hook **auto‑schedules** the next one.
- **`manual: true`** — runs **one tick** and then pauses. To continue, call `resume()` **inside** the `callback` or `run()` **from outside**.
- **`disabled`** — pauses the loop; switching it back to `false` resumes the loop.
- **`resetElapsedOnResume`**:
   - `false` — continue with the **remaining** time of the current interval;
   - `true` — next interval starts **from zero** with full duration.

---

## Behavior

1. Each tick schedules the next one according to the options (`manual`, `disabled`).
2. The `callback` receives `actualTime` — the **real** duration of the last interval.
3. Pausing (`disabled: true`) stops the loop. Resuming continues either with the leftover time or from zero — depending on `resetElapsedOnResume`.
4. Changing `durationMs` is applied predictably: it either respects the current progress (if configured so) or takes effect on the next tick.
5. On unmount, the timer is properly cleared.

---

## Examples

### 1) Basic loop, manual start

```tsx
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [run] = useLoop(({ actualTime }) => {
    console.log('tick ~', actualTime, 'ms');
  }, 1000);

  return <button onClick={run}>Start</button>;
}
```

### 2) Autostart and automatic rescheduling

```tsx
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [run] = useLoop(({ actualTime }) => {
    // runs roughly every ~500ms
  }, {
    durationMs: 500,
    autorun: true,
  });

  return <button onClick={run}>Restart</button>;
}
```

### 3) Manual mode: one tick at a time

```tsx
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [run] = useLoop(({ actualTime, resume }) => {
    doWork();
    if (shouldContinue()) {
      resume(); // continue the next tick right from the callback
    }
  }, {
    durationMs: 800,
    manual: true,
  });

  return <button onClick={run}>Tick</button>;
}
```

### 4) Pause/resume from the outside

```tsx
import { useState } from 'react';
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [paused, setPaused] = useState(false);
  const [run] = useLoop(() => {
    // ...
  }, {
    durationMs: 1000,
    autorun: true,
    disabled: paused,
  });

  return (
    <>
      <button onClick={() => setPaused(true)}>Pause</button>
      <button onClick={() => setPaused(false)}>Resume</button>
      <button onClick={run}>Restart</button>
    </>
  );
}
```

### 5) Changing duration without resetting leftover time

```tsx
import { useState } from 'react';
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [ms, setMs] = useState(1000);
  const run = useLoop(() => {}, { durationMs: ms, autorun: true, resetElapsedOnResume: false });

  return (
    <>
      <button onClick={() => setMs(2000)}>Make 2s</button>
      <button onClick={run}>Restart</button>
    </>
  );
}
```

---

## When to Use

- You need **periodic** logic with pause/resume.
- You want to account for **drift** (get the actual tick time via `actualTime`).
- You need a **manual mode** (continue from inside the `callback`).

## When **Not** to Use

- You need a single run after N ms — use `useTimeout` or `useTimeoutExtended` instead.
- You need frame‑based ticks — prefer `useFrame` or `useFrameExtended`.
- You need to **catch up missed ticks** in batches — `useLoop` schedules one tick at a time and does not perform catch‑up.

---

## Common Mistakes

- In `manual: true` the loop will **not** continue by itself — you must call `resume()` in the `callback` or `run()` from outside.
- `autorun` with `disabled: true` will not start anything until `disabled` is turned off.
- With `resetElapsedOnResume: true`, changing `durationMs` does **not** affect the **current** timer — only the next one.

---

## Types

**Exported types**

- `UseLoopCallback(options)` — `{ actualTime: number; resume: () => void }`.
- `UseLoopOptions` — see options above.
- `UseLoopReturn` — externally you get `run()` (tuple/object depending on how you destructure).

---

## See also

- [useFrame](useFrame.md)
- [useFrameExtended](useFrameExtended.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
