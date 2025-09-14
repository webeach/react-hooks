# `useStatus`

## Описание

`useStatus` — хук для управления дискретным статусом процесса: `'initial'`, `'pending'`, `'success'`, `'error'`. Возвращает **объект**, объединяющий текущие флаги (`isPending`, `isSuccess`, `isError`), опциональную ошибку `error` (только в статусе `'error'`) и методы управления: `setPending`, `setSuccess`, `setError`, `reset`, `setStatus`.

---

## Сигнатура

```ts
function useStatus(defaultStatus?: Status): UseStatusReturn;
```

- **Параметры**
  - `defaultStatus?: Status` — начальный статус; по умолчанию `'initial'`.

- **Возвращает**: `UseStatusReturn` — комбинированный объект:
  - флаги: `isPending`, `isSuccess`, `isError`;
  - поле `error` (только при статусе `'error'`, иначе `null`);
  - методы управления: `setPending()`, `setSuccess()`, `setError(error?)`, `reset()`, `setStatus(status)`.

---

## Примеры

### 1) Типичный async‑цикл: pending → success / error

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
      // error может быть произвольным — приведём к ErrorLike
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

### 2) Сброс статуса

```tsx
const status = useStatus('success');

// …
status.reset(); // → 'initial'
```

### 3) Ручная установка статуса

```tsx
const status = useStatus();

status.setStatus('pending');
// …
status.setStatus('success');
```

---

## Поведение

1. **Флаги и ошибка**
   - Флаги `isPending`, `isSuccess`, `isError` взаимоисключающие; `error` задано **только** при статусе `'error'` (иначе `null`).

2. **`setError(error?)`**
   - Переводит статус в `'error'` и сохраняет переданный объект ошибки (или `null`, если аргумент не указан). В UI проверяйте оба: `isError` и `error`.

3. **`setPending()` / `setSuccess()` / `reset()`**
   - Переводят статус соответственно в `'pending'` / `'success'` / `'initial'`. При этом `error` становится `null`.

4. **`setStatus(status)`**
   - Прямая установка одного из допустимых статусов. Используйте, когда переход определяется внешней логикой.

5. **Совместимость с UI‑паттернами**
   - Удобно блокировать элементы (`disabled={status.isPending}`), показывать прогресс/ошибки и сбрасывать состояние по событию (`status.reset()`).

---

## Когда использовать

- Запросы к API, загрузка/сохранение данных, длительные операции.
- Кнопки «Отправить/Сохранить», формы, модальные окна с асинхронной логикой.
- Любой процесс со стандартными стадиями: ожидание → успех → ошибка.

---

## Когда **не** использовать

- Если требуется сложный автомат (несколько веток/подстатусов) — рассмотрите `useReducer` или конечные автоматы.
- Если статус можно вывести из самих данных (например, «успех, когда список не пуст») — храните минимально необходимое состояние.

---

## Частые ошибки

1. **Использование строки вместо `ErrorLike`**
   - `setError` ожидает объект с полем `message`. Преобразуйте значение: `setError({ message: String(error) })`.

2. **Отрисовка текста ошибки без проверки статуса**
   - Проверяйте `status.error !== null` перед выводом сообщения.

3. **Забытый переход в `'pending'`**
   - Перед началом async‑операции вызывайте `status.setPending()`, иначе UI может не показать ожидание.

4. **Смешение ручной и автоматической логики**
   - Если используете `setStatus` напрямую, убедитесь, что это не конфликтует с автоматическими вызовами `setPending/Success/Error` в обработчиках.

---

## Типизация

**Экспортируемые типы**

## Типизация

**Экспортируемые типы**

- `UseStatusReturn`
   - Объединяет статусные флаги, возможную ошибку и методы управления.
   - Поля:
      - `isPending: boolean` — `true`, если статус в процессе выполнения.
      - `isSuccess: boolean` — `true`, если операция завершилась успешно.
      - `isError: boolean` — `true`, если произошла ошибка.
      - `error: ErrorLike | null` — объект ошибки (только если `isError: true`).
   - Методы:
      - `reset(): void` — сбрасывает статус в `'initial'`.
      - `setError(error?: ErrorLike | null): void` — переводит в `'error'` и сохраняет ошибку.
      - `setPending(): void` — переводит в `'pending'`.
      - `setSuccess(): void` — переводит в `'success'`.
      - `setStatus(status: Status): void` — устанавливает статус напрямую.

---

## Смотрите также

- [useAsyncCallback](useAsyncCallback.md)
- [useAsyncHandler](useAsyncHandler.md)
