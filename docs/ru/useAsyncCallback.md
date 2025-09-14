# `useAsyncCallback`

## Описание

`useAsyncCallback` — хук‑обёртка над асинхронной функцией, который отслеживает её статус (`'pending'` / `'success'` / `'error'`), поддерживает **ленивую реактивность** (перерисовки начинаются только после первого обращения к `status`) и защищает от гонок: только **последний** вызов влияет на статус. Предоставляет методы: `handler` (вызов асинхронной операции) и `abort()` (сброс/отмена актуального вызова).

Возвращаемая структура — *гибрид* для кортежной и объектной деструктуризации: `[handler, status, abort]` **и** `{ handler, status, abort }`.

---

## Сигнатура

```ts
function useAsyncCallback<Args extends unknown[], R>(
  asyncCallback: (...args: Args) => Promise<R>,
): UseAsyncCallbackReturn<Args, R>;
```

- **Параметры**
   - `asyncCallback` — асинхронная функция, статус выполнения которой нужно отслеживать.

- **Возвращает**: `UseAsyncCallbackReturn<Args, R>` — гибридная структура:
   - `handler(...args): Promise<R>` — обёртка над исходной функцией;
   - `status` — флаги `isPending`, `isSuccess`, `isError` и `error` (только при ошибке);
   - `abort()` — отменяет актуальный вызов и переводит статус в `'initial'`.

---

## Примеры

### 1) Кнопка «Сохранить»: блокировка и показ ошибок

```tsx
import { useAsyncCallback } from '@webeach/react-hooks/useAsyncCallback';

type SaveButtonProps = {
  save: () => Promise<void>;
};

export function SaveButton(props: SaveButtonProps) {
  const { save } = props;
  
  const { handler: onSave, status, abort } = useAsyncCallback(save);

  return (
    <>
      <button onClick={() => onSave()} disabled={status.isPending}> 
        {status.isPending ? 'Saving…' : 'Save'}
      </button>

      {status.isError && status.error !== null && (
        <div role="alert">{status.error.message}</div>
      )}

      {/* При необходимости дать пользователю отмену */}
      {status.isPending && (
        <button onClick={abort} type="button">Cancel</button>
      )}
    </>
  );
}
```

### 2) Использование без реактивности (не читаем `status`)

```tsx
const [submit] = useAsyncCallback(async (form: FormData) => {
  await api.submit(form);
});

// Компонент не будет перерисовываться при смене статуса,
// т.к. `status` ни разу не прочитан. При необходимости — await/try-catch.
```

### 3) Поиск с отменой предыдущего запроса

```tsx
import { ChangeEventHandler } from 'react';
import { useAsyncCallback } from '@webeach/react-hooks/useAsyncCallback';

export function SearchBox() {
  const {handler: load, status, abort} = useAsyncCallback(async (q: string) => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);

    if (!response.ok) {
      throw new Error('Network error');
    }

    return res.json();
  });

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    abort();                   // отменяем прошлый запрос логически
    void load(event.target.value); // запускаем новый
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

## Поведение

1. **Ленивая реактивность**
   - Пока к полю `status` **не обращались**, изменения статуса **не** вызывают перерисовку. При первом чтении `status` реактивность включается автоматически, и далее обновления будут отражаться в UI.

2. **Защита от гонок**
   - Если `handler` вызывается повторно до завершения предыдущего вызова, только **последний** вызов сможет изменить статус. Завершения «устаревших» вызовов игнорируются.

3. **Статусы и ошибка**
   - Доступны флаги `isPending`, `isSuccess`, `isError` и `error` (`ErrorLike | null`). Если выброшено значение не формата `ErrorLike`, хук попытается привести его к корректному виду (`string` → `Error`).

4. **`abort()`**
   - Сбрасывает статус в `'initial'` и помечает текущий вызов как отменённый. Сетевые запросы при этом **не прерываются физически** — используйте `AbortController` внутри `asyncCallback`, если нужна реальная отмена I/O.

5. **Поведение при размонтировании**
   - При размонтировании компонента выполняется `abort()` автоматически, чтобы избежать гонок и утечек состояния.

6. **Гибридная структура**
   - Результат доступен и как кортеж `[handler, status, abort]`, и как объект `{ handler, status, abort }` — выбирайте форму под свой стиль кода.

---

## Когда использовать

- Обёртка над сетевыми запросами/асинхронными операциями с управлением статуса.
- Блокировка UI на время запроса (`disabled={status.isPending}`), показ ошибок и индикаций.
- Сценарии, где важна защита от гонок при множественных последовательных вызовах.

---

## Когда **не** использовать

- Если хватает прямого `useState`+`useCallback` без статусов.
- Если нужна интеграция с внешним менеджером состояний/запросов (React Query и др.) — используйте их возможности.
- Если обязателен «жёсткий» cancel I/O — стройте отмену внутри `asyncCallback` через `AbortController`/сигналы.

---

## Частые ошибки

1. **Ожидание перерисовок без чтения `status`**
   - Если `status` не используется, перерисовок не будет. Либо читайте `status`, либо управляйте UI через `await`/`try-catch`/внешнее состояние.

2. **Игнорирование выброшенной ошибки**
   - `handler` пробрасывает ошибку вызова. Оборачивайте в `try/catch`, если не используете `status.isError`.

3. **Путаница с «отменой»**
   - `abort()` не отменяет сетевой запрос сам по себе — только сбрасывает внутренний статус и «аннулирует» результат текущего вызова.

4. **Случайная гонка из‑за параллельных вызовов**
   - Не запускайте конкурирующие вызовы без необходимости. Если это ожидаемо, UI должен учитывать, что статус отображает **последний** вызов.

---

## Типизация

**Экспортируемые типы**

- `UseAsyncCallbackReturn<Args, ReturnType>`
   - Гибридный тип результата: кортеж `[handler, status, abort]` **и** объект `{ handler, status, abort }`.

- `UseAsyncCallbackReturnObject<Args, ReturnType>`
   - Объектная форма результата с полями `handler`, `status`, `abort`.

- `UseAsyncCallbackReturnTuple<Args, ReturnType>`
   - Кортежная форма: `[handler: (...args: Args) => Promise<R>, status: StatusStateMapTuple & StatusStateMap, abort: () => void]`.

- `UseAsyncCallbackAbortHandler`
   - Сигнатура функции отмены: `() => void`.

---

## Смотрите также

- [useAsyncHandler](useAsyncHandler.md)
- [useCallbackCompare](useCallbackCompare.md)
- [useDebounceCallback](useDebounceCallback.md)
- [useStatus](useStatus.md)
- [useThrottleCallback](useThrottleCallback.md)
