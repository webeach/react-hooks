# `useFrame`

## Description

`useFrame` is a hook that calls your callback **on every animation frame** using `requestAnimationFrame`. The callback receives useful timing information:
- `frame` — the frame number, starting at `1`;
- `deltaTime` — milliseconds elapsed since the previous frame;
- `timeSinceStart` — milliseconds elapsed since the first frame.

This hook is useful for animations, syncing with the screen refresh rate, measurements, and incremental computations.

---

## Signature

```ts
function useFrame(callback: UseFrameCallback): void;
```

- **Parameters**
   - `callback` — function called on each `requestAnimationFrame` with timing info.

- **Returns**
   - `void` — no direct value; the hook only subscribes/unsubscribes to frames.

---

## Examples

### 1) Logging frame timings

```tsx
import { useFrame } from '@webeach/react-hooks/useFrame';

export function Logger() {
  useFrame(({ frame, deltaTime, timeSinceStart }) => {
    if (frame % 60 === 0) {
      console.log('frame', frame, 'Δ', deltaTime.toFixed(2), 'ms', 'total', timeSinceStart.toFixed(2), 'ms');
    }
  });
  return null;
}
```

### 2) Smooth movement (using `deltaTime`)

```tsx
import { useRef } from 'react';
import { useFrame } from '@webeach/react-hooks/useFrame';

export function BoxMover() {
  const boxRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);

  useFrame(({ deltaTime }) => {
    xRef.current += 0.1 * deltaTime; // 0.1px per millisecond (≈6px/frame at 60fps)
    if (boxRef.current) {
      boxRef.current.style.transform = `translateX(${xRef.current}px)`;
    }
  });

  return <div ref={boxRef} style={{ width: 40, height: 40, backgroundColor: 'green' }} />;
}
```

### 3) Pause/resume animation

```tsx
import { useState } from 'react';
import { useFrame } from '@webeach/react-hooks/useFrame';
import { useToggle } from '@webeach/react-hooks/useToggle';

export function Clock() {
  const [paused, togglePaused] = useToggle(false);
  const [ms, setMs] = useState(0);

  useFrame(({ deltaTime }) => {
    if (paused) return;
    setMs((prev) => prev + deltaTime);
  });

  return (
    <div>
      <output>{ms.toFixed(0)} ms</output>
      <button onClick={togglePaused}>{paused ? 'Resume' : 'Pause'}</button>
    </div>
  );
}
```

---

## Behavior

1. **Frame frequency**
   - The callback is executed once per animation frame; frequency depends on device and tab activity.

2. **Timings**
   - The callback receives `{ frame, deltaTime, timeSinceStart }`, which allows building frame‑independent animations.

3. **Fresh logic**
   - The hook always calls the latest version of `callback`. Updates to props/state are reflected automatically without re-subscribing.

4. **Cleanup**
   - On unmount, the animation frame is canceled to prevent leaks.

5. **Layout phase**
   - The subscription is registered in the layout effect phase, ensuring no frames are missed before paint.

---

## When to use

- Frame-based animations and interpolations (position, opacity, counters).
- Smooth integrations with Canvas/WebGL/SVG rendering.
- Regular measurements or syncing logic with frame timing.

## When **not** to use

- For rare or one-off actions — `setTimeout`/`useEffect` may be enough.
- For heavy computations every frame — distribute work or move it to a Worker to avoid blocking the UI.

---

## Common mistakes

1. **Heavy logic inside the callback**
    - Long tasks increase `deltaTime` and make animations stutter. Keep frame logic lightweight.

2. **Assuming fixed 60fps**
    - Actual frame rate depends on the device and system load. Always use `deltaTime` for consistent animations.

3. **Mutating refs without re-render**
    - Updating a plain variable won’t re-render the component. Use `useState` if UI needs to react.

---

## Typing

**Exported types**

- `UseFrameCallback`
   - `(info: { frame: number; deltaTime: number; timeSinceStart: number }) => void` — function called on each frame with timing info.

---

## See also

- [useFrameExtended](useFrameExtended.md)
- [useLoop](useLoop.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
