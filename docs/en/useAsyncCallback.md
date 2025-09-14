# `useAsyncCallback`

## Description

`useAsyncCallback` is a hook wrapper around an asynchronous function. It tracks its execution status (`'pending'` / `'success'` / `'error'`), supports **lazy reactivity** (re-renders only start after `status` is read for the first time), and protects against race conditions: only the **latest** call can update the status. It provides methods: `handler` (to invoke the async operation) and `abort()` (to cancel/reset the current call).

The return value is a *hybrid* that works with both tuple and object destructuring: `[handler, status, abort]` **and** `{ handler, status, abort }`.

---

## Signature

```ts
function useAsyncCallback<Args extends unknown[], R>(
  asyncCallback: (...args: Args) => Promise<R>,
): UseAsyncCallbackReturn<Args, R>;
```

- **Parameters**
   - `asyncCallback` — the async function whose execution status should be tracked.

- **Returns**: `UseAsyncCallbackReturn<Args, R>` — a hybrid structure:
   - `handler(...args): Promise<R>` — a wrapper around the original async function.
   - `status` — flags `isPending`, `isSuccess`, `isError`, and `error` (present only when an error occurs).
   - `abort()` — logically cancels the current call and resets the status to `'initial'`.

---

## Examples

### 1) Save button: disable while loading & show errors

```tsx
import { useAsyncCallback } from '@webeach/react-hooks/useAsyncCallback';

type SaveButtonProps = {
  save: () => Promise<void>;
};

export function SaveButton(props: SaveButtonProps) {
  const { save } = props;
**
   - const { handler: onSave, status, abort } = useAsyncCallback(save);

  return (
    <>
      <button onClick={() => onSave()} disabled={status.isPending}> 
        {status.isPending ? 'Saving…' : 'Save'}
      </button>

      {status.isError && status.error !== null && (
        <div role="alert">{status.error.message}</div>
      )}

      {/* Optional: let the user cancel */}
      {status.isPending && (
        <button onClick={abort} type="button">Cancel</button>
      )}
    </>
  );
}
```

### 2) Usage without reactivity (not reading `status`)

```tsx
const [submit] = useAsyncCallback(async (form: FormData) => {
  await api.submit(form);
});

// The component will NOT re-render on status changes,
// since `status` is never read. Use await/try-catch if needed.
```

### 3) Search with cancellation of previous requests

```tsx
import { ChangeEventHandler } from 'react';
import { useAsyncCallback } from '@webeach/react-hooks/useAsyncCallback';

export function SearchBox() {
  const { handler: load, status, abort } = useAsyncCallback(async (q: string) => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);

    if (!response.ok) {
      throw new Error('Network error');
    }

    return response.json();
  });

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    abort();                   // logically cancel the previous request
    void load(event.target.value); // start a new one
  };

  return (
    <div>
      <input onChange={handleInputChange} placeholder="Search…"/>
      {status.isPending && <span>Loading…</span>}
      {status.isError && <span role="alert">{status.error?.message}</span>}
    </div>
  );
}
```

---

## Behavior

1. **Lazy reactivity**
   - Until you actually read the `status` field, status changes **do not** trigger re-renders. Once `status` is read, reactivity is enabled and subsequent updates will reflect in the UI.

2. **Race condition safety**
   - If `handler` is called again before the previous call finishes, only the **latest** call can update the status. Results from outdated calls are ignored.

3. **Statuses and error**
   - Provides flags: `isPending`, `isSuccess`, `isError`, and `error` (`ErrorLike | null`). If a non-`ErrorLike` value is thrown, the hook attempts to convert it into an `Error` (e.g. a `string` → `Error`).

4. **`abort()`**
   - Resets the status back to `'initial'` and marks the current call as canceled. It does **not** physically cancel network requests — use `AbortController` inside `asyncCallback` for real I/O cancellation.

5. **Unmount behavior**
   - On component unmount, `abort()` is called automatically to prevent race conditions and state leaks.

6. **Hybrid return structure**
   - The return value can be used both as a tuple `[handler, status, abort]` and as an object `{ handler, status, abort }` — pick whichever fits your code style.

---

## When to use

- Wrapping async requests/operations with built‑in status tracking.
- Disabling UI while a request is pending (`disabled={status.isPending}`), and showing success or error states.
- Scenarios where race condition protection matters (only the last call affects state).

---

## When **not** to use

- If plain `useState` + `useCallback` is enough without status tracking.
- If you rely on external state/data fetching libraries (e.g. React Query) — prefer their built‑in features.
- If you need true low‑level cancellation of network requests — implement `AbortController` inside your `asyncCallback`.

---

## Common mistakes

1. **Expecting re-renders without reading `status`**
   - If you never use `status`, the component won’t re-render on updates. Either consume `status` or handle async flow via `await`/`try-catch`.

2. **Ignoring thrown errors**
   - The wrapped `handler` rethrows any error. Always use `try/catch` if you don’t rely on `status.isError`.

3. **Misunderstanding `abort()`**
   - `abort()` only resets internal state and ignores outdated results — it does not cancel the underlying fetch. Use `AbortController` if cancellation is required.

4. **Starting overlapping calls unintentionally**
   - Since only the latest call updates state, launching multiple calls simultaneously may hide earlier results.

---

## Typing

**Exported types**

- `UseAsyncCallbackReturn<Args, ReturnType>`**
   - Hybrid return type: tuple `[handler, status, abort]` **and** object `{ handler, status, abort }`.

- `UseAsyncCallbackReturnObject<Args, ReturnType>`**
   - Object form with fields `handler`, `status`, `abort`.

- `UseAsyncCallbackReturnTuple<Args, ReturnType>`**
   - Tuple form: `[handler: (...args: Args) => Promise<R>, status: StatusStateMapTuple & StatusStateMap, abort: () => void]`.

- `UseAsyncCallbackAbortHandler`**
   - Function signature for cancellation: `() => void`.

---

## See also

- [useAsyncHandler](useAsyncHandler.md)
- [useCallbackCompare](useCallbackCompare.md)
- [useDebounceCallback](useDebounceCallback.md)
- [useStatus](useStatus.md)
- [useThrottleCallback](useThrottleCallback.md)
