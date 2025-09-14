# `useAsyncHandler`

## Description

`useAsyncHandler` is a hook that **automatically executes** an asynchronous function on mount and every time its dependency list (`deps`) changes. It provides the current execution state through `status` (`isPending`, `isSuccess`, `isError`, `error`). Internally, it uses `useAsyncCallback`, so status updates are **lazy** — re-renders start only after the first time you read `status`.

The hook returns a *hybrid* structure that supports both tuple and object destructuring:
- Tuple: `[status]`
- Object: `{ status }`

---

## Signature

```ts
function useAsyncHandler(
  handler: UseAsyncHandlerFunction,
  deps: React.DependencyList,
): UseAsyncHandlerReturn;
```

- **Parameters**
   - `handler` — an asynchronous function without arguments that will be executed automatically.
   - `deps` — a dependency array (like in the second argument of `useEffect`); whenever dependencies change, `handler` is executed again.

- **Returns**: `UseAsyncHandlerReturn` — a hybrid structure containing:
   - `status` — includes `isPending`, `isSuccess`, `isError`, and `error`.

---

## Examples

### 1) Data fetching on mount

```tsx
import { useAsyncHandler } from '@webeach/react-hooks/useAsyncHandler';

export function DataLoader() {
  const { status } = useAsyncHandler(async () => {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error('Network error');
    }

    const result = await response.json();
    console.log(result);
  }, []);

  if (status.isPending) {
    return <div>Loading…</div>;
  }

  if (status.isError) {
    return <div role="alert">{status.error?.message}</div>;
  }

  return <div>Done</div>;
}
```

### 2) Refetching when dependencies change

```tsx
import { useAsyncHandler } from '@webeach/react-hooks/useAsyncHandler';

type SearchProps = {
  query: string;
  page: number;
};

export function Search(props: SearchProps) {
  const { query, page } = props;

  const { status } = useAsyncHandler(async () => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);

    if (!res.ok) {
      throw new Error('Failed to load');
    }

    const result = await res.json();
    console.log(result);
  }, [query, page]);

  return (
    <div>
      {status.isPending && <span>Loading…</span>}
      {status.isError && <span role="alert">{status.error?.message}</span>}
    </div>
  );
}
```

---

## Behavior

1. **Automatic execution on `deps`**
   - Runs `handler` on mount and every time `deps` change. If `handler` throws an error, `status` becomes `'error'`.

2. **Lazy reactivity**
   - Status updates don’t trigger re-renders until you actually read `status`. Once read, reactivity is enabled for future changes.

3. **Cleanup and cancellation**
   - On unmount, the current execution is logically canceled (only the latest call can update the status). This prevents race conditions and updates after unmount.

4. **Development logs**
   - In development mode, errors thrown inside `handler` are also logged to the console.

5. **Hybrid return structure**
   - Can be used as a tuple `[status]` or as an object `{ status }`.

6. **No manual control**
   - This hook does not provide `abort()` or `handler()` to call manually. If you need explicit control, use `useAsyncCallback` instead.

---

## When to use

- Automatically trigger async operations on mount and when dependencies change.
- Pages or widgets that need to fetch data whenever route/locale/filter params change.
- Simple flows: *request → loading → success/error* without manual retries.

---

## When **not** to use

- You need manual triggering, cancellation, or retries — use `useAsyncCallback` instead.
- You need advanced dependency comparison — use `useEffectCompare` or manage dependencies manually.
- You need full-featured data-fetching management (caching, refetch policies, pagination) — consider React Query or similar libraries.

---

## Common mistakes

1. **Missing dependencies**
   - Forgetting a dependency in `deps` can lead to stale results.

2. **Unstable dependencies**
   - Passing a new object/function on every render will cause unnecessary re-runs. Use `useMemo` / `useCallback`.

3. **Expecting manual control**
   - `useAsyncHandler` is fully automatic. It doesn’t expose `handler()` or `abort()`.

4. **Not handling errors**
   - Always handle `status.isError` and use `status.error?.message` in your UI. In development, errors are also logged to the console, but you should not rely on that.

---

## Typing

**Exported types**

- `UseAsyncHandlerFunction`
   - Asynchronous function without arguments: `() => Promise<void>`.

- `UseAsyncHandlerReturn`
   - Hybrid return type: tuple `[status]` **and** object `{ status }`.

- `UseAsyncHandlerReturnObject`
   - Object form: `{ status: StatusStateMapTuple & StatusStateMap }`.

- `UseAsyncHandlerReturnTuple`
   - Tuple form: `[status: StatusStateMapTuple & StatusStateMap]`.

---

## See also

- [useAsyncCallback](useAsyncCallback.md)
- [useStatus](useStatus.md)
