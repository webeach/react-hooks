# `useImageLoader`

## Описание

`useImageLoader` — хук для **загрузки изображения** с удобными флагами состояния: `isPending`, `isSuccess`, `isError`, а также `error`. Возвращает *гибридную* структуру (кортеж и объект), поля которой вычисляются «по требованию».

Хук инициирует загрузку при каждом изменении `imageUrl`, сообщает об успехе/ошибке/отмене и в режиме разработки предупреждает, если передана пустая строка.

---

## Сигнатура

```ts
function useImageLoader(imageUrl: string): UseImageReturn;
```

- **Параметры**
   - `imageUrl` — URL изображения, которое нужно загрузить.

- **Возвращает**: `UseImageReturn` — гибридная структура со статусами загрузки:
   - `isPending: boolean`
   - `isSuccess: boolean`
   - `isError: boolean`
   - `error: { message: string } | null`

---

## Примеры

### 1) Объектный доступ: показ спиннера/фолбэка

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

### 2) Кортежный доступ: быстрые проверки

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

## Поведение

1. **Триггеры загрузки**
   - При первом маунте и при каждом изменении `imageUrl` хук начинает новую загрузку и ставит статус `isPending`.

2. **Переходы статусов**
   - Успех — `isSuccess = true` после `onload`.
   - Ошибка — `isError = true` и заполнен `error` после `onerror`.
   - Отмена — трактуется как ошибка с сообщением об отмене (через `onabort`).

3. **Очистка**
   - На анмаунте снимаются обработчики, чтобы избежать утечек. Сама сетевая загрузка браузером принудительно не отменяется.

4. **Dev‑предупреждение**
   - В режиме разработки при `imageUrl === ''` выводится предупреждение: пустой URL может привести к запросу текущей страницы как изображения.

5. **SSR‑безопасность**
   - Логика использует `useEffect`, поэтому не выполняется на сервере.

---

## Когда использовать

- Отложенный показ контента до готовности изображения (скелетон/прелоадер/фолбэк).
- Прелоадинг изображений галерей и карточек перед отображением.
- Простая индикация статуса без ручной работы с `Image` и обработчиками.

---

## Когда **не** использовать

- Если нужно **получить сам `HTMLImageElement`** или тонко управлять загрузкой/отменой — пишите собственную обёртку над `Image` или используйте Fetch + `AbortController`.
- Если изображение уже гарантированно в кэше и статус не нужен — можно отрисовать `<img>` напрямую.

---

## Частые ошибки

1. **Пустой URL**
   - Передача `''` приводит к dev‑предупреждению и может вызвать некорректный запрос. Передавайте валидный URL.

2. **Ожидание автоматической отмены загрузки**
   - Хук снимает обработчики, но не отменяет сетевой запрос браузера. Для жёсткой отмены используйте другой подход (например, предварительную загрузку через Fetch с `AbortController`).

3. **Неправильная логика отображения**
   - Не забывайте проверять `isError` и показывать фолбэк; `isSuccess` не наступит при ошибке/отмене.

---

## Типизация

**Экспортируемые типы**

- `UseImageReturn`
   - Гибрид: кортеж `[isPending, isSuccess, isError, error]` **и** объект `{ isPending; isSuccess; isError; error }`.

---

## Смотрите также

- [useStatus](useStatus.md)
