# `useStatus`

## Description

`useStatus` is a hook for managing a discrete process status: `'initial'`, `'pending'`, `'success'`, `'error'`. It returns an **object** that combines the current flags (`isPending`, `isSuccess`, `isError`), an optional `error` (only in the `'error'` state), and control methods: `setPending`, `setSuccess`, `setError`, `reset`, `setStatus`.

---

## Signature

```ts
function useStatus(defaultStatus?: Status): UseStatusReturn;
```

- **Parameters**
   - `defaultStatus?: Status` — initial status; defaults to `'initial'`.

- **Returns**: `UseStatusReturn` — a combined object:
   - flags: `isPending`, `isSuccess`, `isError`;
   - `error` field (only in `'error'`, otherwise `null`);
   - control methods: `setPending()`, `setSuccess()`, `setError(error?)`, `reset()`, `setStatus(status)`.

---

## Examples

### 1) Typical async cycle: pending → success / error

```tsx
import { useStatus } from '@webeach/react-hooks/useStatus';

export type SaveButtonProps = {
  save: () => Promise<void>;
};

export function SaveButton(props: SaveButtonProps) {
  const { save } = props;
  
  const status = useStatus();

  const handleClick = async () => {
    status.setPending();
    try {
      await save();
      status.setSuccess();
    } catch (error) {
      // `error` can be anything — normalize to ErrorLike
      const message = error instanceof Error ? error.message : String(error);
      status.setError({ message });
    }
  };

  return (
    <>
      <button onClick={handleClick} disabled={status.isPending}>
        {status.isPending ? 'Saving…' : 'Save'}
      </button>
      {status.error !== null && <div role="alert">{status.error.message}</div>}
    </>
  );
}
```

### 2) Reset status

```tsx
const status = useStatus('success');

// …
status.reset(); // → 'initial'
```

### 3) Manual status assignment

```tsx
const status = useStatus();

status.setStatus('pending');
// …
status.setStatus('success');
```

---

## Behavior

1. **Flags and error**
   - The flags `isPending`, `isSuccess`, `isError` are mutually exclusive. `error` is set **only** in the `'error'` state (otherwise `null`).

2. **`setError(error?)`**
   - Switches the status to `'error'` and stores the provided error object (or `null` if omitted). In the UI, check both `isError` and `error`.

3. **`setPending()` / `setSuccess()` / `reset()`**
   - Move the status to `'pending'` / `'success'` / `'initial'` respectively. In all cases, `error` becomes `null`.

4. **`setStatus(status)`**
   - Directly set one of the allowed statuses. Useful when the transition is dictated by external logic.

5. **UI patterns compatibility**
   - Handy for disabling elements (`disabled={status.isPending}`), showing progress/errors, and resetting state on events (`status.reset()`).

---

## When to Use

- API requests, data loading/saving, long‑running operations.
- Submit/Save buttons, forms, modals with async logic.
- Any process with common stages: waiting → success → error.

---

## When **Not** to Use

- If you need a complex state machine (multiple branches/sub‑statuses) — consider `useReducer` or a finite‑state machine.
- If the status can be derived from the data itself (e.g., “success when the list is not empty”) — store only the minimal state.

---

## Common Mistakes

1. **Passing a string instead of `ErrorLike`**
   - `setError` expects an object with a `message` field. Normalize the value: `setError({ message: String(error) })`.

2. **Rendering error text without checking the status**
   - Check `status.error !== null` before rendering the message.

3. **Forgetting to switch to `'pending'`**
   - Call `status.setPending()` before starting an async operation; otherwise the UI may not reflect the waiting state.

4. **Mixing manual and automatic logic**
   - If you use `setStatus` directly, make sure it doesn’t conflict with automatic calls to `setPending/Success/Error` in your handlers.

---

## Typing

**Exported types**

- `UseStatusReturn`
   - Combines status flags, possible error, and control methods.
   - Fields:
    - `isPending: boolean` — `true` while the operation is in progress.
    - `isSuccess: boolean` — `true` when the operation has completed successfully.
    - `isError: boolean` — `true` when an error has occurred.
    - `error: ErrorLike | null` — error object (only if `isError: true`).
   - Methods:
    - `reset(): void` — sets status to `'initial'`.
    - `setError(error?: ErrorLike | null): void` — sets status to `'error'` and stores the error.
    - `setPending(): void` — sets status to `'pending'`.
    - `setSuccess(): void` — sets status to `'success'`.
    - `setStatus(status: Status): void` — sets the status directly.

---

## See Also

- [useAsyncCallback](useAsyncCallback.md)
- [useAsyncHandler](useAsyncHandler.md)
