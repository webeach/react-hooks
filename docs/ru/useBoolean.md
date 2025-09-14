# `useBoolean`

## Описание

`useBoolean` — хук для управления булевым состоянием с удобными колбэками `setTrue` и `setFalse`.
Хук возвращает *гибридную* структуру, поддерживающую как **кортежную** (tuple) деструктуризацию, так и **объектную**:

- Кортеж: `[value, setTrue, setFalse]`
- Объект: `{ value, setTrue, setFalse }`

Это позволяет выбирать наиболее удобный синтаксис под конкретный кейс: компактная запись в компонентах или именованный доступ в сложных местах.

---

## Сигнатура

```ts
function useBoolean(initialValue?: boolean): UseBooleanReturn;
```

- **Параметры**
   - `initialValue?: boolean` — начальное значение, по умолчанию `false`.

- **Возвращает**: `UseBooleanReturn` — гибридная структура с полями и позициями:
   - `value: boolean` — текущее значение;
   - `setTrue(): void` — установить `true`;
   - `setFalse(): void` — установить `false`;
   - кортежный доступ: `[value, setTrue, setFalse]`.

---

## Примеры

### 1) Базовое использование (кортеж)

```tsx
import { useBoolean } from '@webeach/react-hooks/useBoolean';

export function ModalToggle() {
  const [isOpen, open, close] = useBoolean();

  return (
    <div>
      <button onClick={open}>Open modal</button>
      {isOpen && (
        <div role="dialog">
          <p>Content…</p>
          <button onClick={close}>Close</button>
        </div>
      )}
    </div>
  );
}
```

### 2) Именованный доступ (объект)

```tsx
import { useBoolean } from '@webeach/react-hooks/useBoolean';

export function Details() {
  const bool = useBoolean(true); // стартуем со значения true

  return (
    <section>
      <header>
        <button onClick={bool.setFalse}>Hide</button>
        <button onClick={bool.setTrue}>Show</button>
      </header>
      {bool.value && <div>Visible section</div>}
    </section>
  );
}
```

### 3) Стабильные обработчики в зависимостях эффектов

```tsx
import { useEffect } from 'react';
import { useBoolean } from '@webeach/react-hooks/useBoolean';

export function LiveSubscription() {
  const { value: enabled, setTrue, setFalse } = useBoolean(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'e') setTrue();
      if (e.key === 'd') setFalse();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTrue, setFalse]); // можно не указывать в зависимостях, так как они всегда являются одной ссылкой

  return <div>Enabled: {String(enabled)}</div>;
}
```

---

## Поведение

1. **Простая модель состояния**
   - Хранит одно булево значение (`useState`).
2. **Мемоизированные экшены**
   - `setTrue` и `setFalse` мемоизированы через `useCallback` и стабильны между рендерами.
3. **Гибридная структура**.
   - Возврат реализован через `useDemandStructure`, поэтому доступны **оба** способа деструктуризации (кортеж и объект) без дублирования вычислений.
4. **Отсутствие побочных эффектов**
   - Хук не использует глобальные объекты (безопасен для SSR/ISR) и не вызывает перерисовки сверх тех, что порождаются изменением булева значения.

---

## Когда использовать

- Тумблеры UI: раскрытие/сворачивание, показ модалок, выпадающих списков, сайдбаров.
- Простейшие флаги состояния: «загружается», «активен», «доступен», «подтверждён» и т.п.
- Когда нужен **минималистичный API** с читаемыми экшенами `setTrue`/`setFalse` и гибким способом деструктуризации.

---

## Когда **не** использовать

- Если предполагаются **сложные переходы состояний** (несколько флагов, зависимые условия) — лучше `useReducer` или специализированный хук.
- Если нужно хранить не только `true/false`, а, например, «on/off/indeterminate» — используйте собственный `useState` c перечислениями или отдельный хук.

---

## Частые ошибки

1. **Переиспользование только кортежа там, где лучше объект**
   - В местах с множеством параметров кортеж теряет читаемость — используйте объект: `{ value, setTrue, setFalse }`.
2. **Разбиение на кортеж и объект одновременно**
   - Выберите один стиль деструктуризации в рамках компонента — так легче поддерживать код.
3. **Ожидание «toggle»**
   - В хук встроены только `setTrue` и `setFalse`. Если нужен `toggle` – используйте хук `useToggle`.

---

## Типизация

**Экспортируемые типы**

- `UseBooleanReturn`
   - Гибрид: кортеж `[boolean, () => void, () => void]` **и** объект `{ value: boolean; setTrue: () => void; setFalse: () => void }`.
- `UseBooleanReturnObject`
   - Объектная форма: `{ value: boolean; setTrue: () => void; setFalse: () => void }`.
- `UseBooleanReturnTuple`
   - Кортежная форма: `[boolean, () => void, () => void]`.

---

## Смотрите также

- [useControlled](useControlled.md)
- [useNumber](useNumber.md)
- [useToggle](useToggle.md)
