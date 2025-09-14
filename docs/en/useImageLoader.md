# `useImageLoader`

## Description

`useImageLoader` is a hook for **loading an image** with convenient state flags: `isPending`, `isSuccess`, `isError`, and `error`. It returns a *hybrid* structure (tuple + object) whose fields are computed **on demand**.

The hook starts loading on every `imageUrl` change, reports success/error/abort, and in development warns if an empty string is provided.

---

## Signature

```ts
function useImageLoader(imageUrl: string): UseImageReturn;
```

- **Parameters**
   - `imageUrl` — the URL of the image to load.

- **Returns**: `UseImageReturn` — a hybrid structure with loading statuses:
   - `isPending: boolean`
   - `isSuccess: boolean`
   - `isError: boolean`
   - `error: { message: string } | null`

---

## Examples

### 1) Object access: show spinner/fallback

```tsx
import { useImageLoader } from '@webeach/react-hooks/useImageLoader';

type AvatarProps = {
  src: string;
  alt: string;
};

export function Avatar(props: AvatarProps) {
  const { src, alt } = props;
  
  const status = useImageLoader(src);

  if (status.isPending) {
    return <Spinner />;
  }
  
  if (status.isError) {
    return <FallbackAvatar alt={alt} />;
  }

  return <img src={src} alt={alt} />;
}
```

### 2) Tuple access: quick checks

```tsx
import { useImageLoader } from '@webeach/react-hooks/useImageLoader';

type GalleryItemProps = {
  image: string;
}

export function GalleryItem(props: GalleryItemProps) {
  const { image } = props;
  
  const [isPending, isSuccess, isError, error] = useImageLoader(image);

  return (
    <figure>
      {isSuccess && <img src={src} alt="" />}
      {isPending && <Skeleton width={160} height={120} />}
      {isError && <div className="error">{error?.message}</div>}
    </figure>
  );
}
```

---

## Behavior

1. **Loading triggers**
   - On the initial mount and on every `imageUrl` change, the hook starts a new load and sets `isPending`.

2. **Status transitions**
   - Success — `isSuccess = true` after `onload`.
   - Error — `isError = true` and `error` is filled after `onerror`.
   - Abort — treated as an error with an "aborted" message (via `onabort`).

3. **Cleanup**
   - On unmount, handlers are removed to avoid leaks. The browser network request is not forcibly aborted.

4. **Dev warning**
   - In development, when `imageUrl === ''`, a warning is logged: an empty URL may trigger a request to the current page as an image.

5. **SSR safety**
   - The logic uses `useEffect`, so it does not run on the server.

---

## When to Use

- Delaying content display until the image is ready (skeleton/loader/fallback).
- Preloading gallery/card images before rendering.
- Simple status indication without manually handling `Image` and event handlers.

---

## When **Not** to Use

- If you need to **obtain the `HTMLImageElement`** itself or finely control loading/cancellation — write your own wrapper around `Image` or use Fetch + `AbortController`.
- If the image is already guaranteed to be in cache and no status is needed — you can render `<img>` directly.

---

## Common Mistakes

1. **Empty URL**
   - Passing `''` leads to a dev warning and may cause an incorrect request. Pass a valid URL.

2. **Expecting automatic cancellation**
   - The hook removes handlers but does not abort the browser's network request. For hard cancellation, use a different approach (e.g., preload via Fetch with `AbortController`).

3. **Incorrect display logic**
   - Don’t forget to check `isError` and show a fallback; `isSuccess` won’t occur on error/abort.

---

## Types

**Exported types**

- `UseImageReturn`
   - Hybrid: tuple `[isPending, isSuccess, isError, error]` **and** object `{ isPending; isSuccess; isError; error }`.

---

## See also

- [useStatus](useStatus.md)
