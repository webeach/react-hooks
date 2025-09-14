# `useRefState`

## Описание

`useRefState` — хук, который объединяет **хранимое в ref значение** и **опциональные перерисовки**. Позволяет обновлять значение **без ререндеров** (по умолчанию) и по требованию включать реактивность, чтобы изменения вызывали перерисовку компонента.

Возвращает кортеж из трёх элементов: `[stateRef, setRefState, actions]`.

---

## Сигнатура

```ts
// 1) Без начального значения
function useRefState<ValueType = undefined>(): readonly [
  stateRef: React.RefObject<ValueType | undefined>,
  setRefState: (value: ValueType | ((prev: ValueType | undefined) => ValueType | undefined) | undefined) => void,
  actions: { disableUpdate(): void; enableUpdate(forceUpdate?: boolean): void },
];

// 2) С начальным значением и начальной реактивностью
function useRefState<ValueType>(
  initialValue: ValueType | (() => ValueType),
  initialUpdatable?: boolean,
): readonly [
  stateRef: React.RefObject<ValueType>,
  setRefState: (value: ValueType | ((prev: ValueType) => ValueType)) => void,
  actions: { disableUpdate(): void; enableUpdate(forceUpdate?: boolean): void },
];
```

- **Параметры**
   - `initialValue` — начальное значение или ленивая функция‑инициализатор.
   - `initialUpdatable` — включить ли перерисовки **сразу** (по умолчанию `false`).

- **Возвращает**: кортеж
   - `stateRef` — `ref`, в `stateRef.current` хранится **актуальное** значение.
   - `setRefState(next)` — обновляет `stateRef.current`. При включённой реактивности вызывает ререндер.
   - `actions` — `{ disableUpdate(), enableUpdate(forceUpdate?) }` для управления реактивностью.

---

## Примеры

### 1) Частые обновления без ререндера + выборочная синхронизация

```tsx
import { useEffect } from 'react';
import { useRefState } from '@webeach/react-hooks/useRefState';

export function Stopwatch() {
  const [timeRef, setTime, { enableUpdate, disableUpdate }] = useRefState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // каждую миллисекунду обновляем ref без ререндера
      setTime((time) => time + 10);
    }, 10);
    return () => clearInterval(id);
  }, [setTime]);

  return (
    <div>
      <div>{timeRef.current} ms</div>
      <button onClick={() => enableUpdate(true)}>Start syncing</button>
      <button onClick={() => disableUpdate()}>Stop syncing</button>
    </div>
  );
}
```

---

## Поведение

1. **Обновление без ререндеров (по умолчанию)**
   - `setRefState(next)` изменяет `stateRef.current`, **не** вызывая перерисовку, пока реактивность отключена.

2. **Включение/выключение реактивности**
   - `disableUpdate()` — отключает перерисовки при будущих изменениях через `setRefState`.
   - `enableUpdate()` — включает перерисовки для **последующих** изменений (без немедленной синхронизации).

3. **`enableUpdate(true)`**
   - Включает перерисовки **и сразу инициирует ререндер, если** текущее отрисованное значение отличается от `stateRef.current`.
   - Это **не** одноразовая синхронизация: после вызова дальнейшие изменения через `setRefState` тоже будут приводить к ререндеру, пока реактивность не отключена. Используйте хук `useForceUpdate`, если нужен разовый ререндер.

4. **Сеттер принимает значение или функцию**
   - Можно передать готовое значение (`setRefState(next)`) либо функцию‑обновитель (`setRefState(prev => next)`).

5. **Стабильность ссылок**
   - Возвращаемые функции и объекты стабильны; безопасно указывать их в зависимостях эффектов/колбэков.

---

## Когда использовать

- Частые/императивные обновления, где ререндер на каждый тик нежелателен (таймеры, курсор, размеры, внешние API).
- Хранение объектов, чья ссылка должна жить независимо от React‑цикла (WebSocket, AudioContext, карты, кэши).
- Пошаговая/ручная синхронизация UI с внутренним состоянием.

---

## Когда **не** использовать

- Если UI **всегда** должен реагировать на изменение значения — используйте `useState`/`useReducer`.
- Если требуется инвариант иммутабельности и детерминированные ререндеры — предпочтительнее обычное состояние.

---

## Частые ошибки

1. **Ожидание, что `enableUpdate(true)` — одноразовый ререндер**
   - На самом деле он **включает** реактивность и сразу делает ререндер **только если** значение менялось; дальше ререндеры будут происходить при каждом обновлении до явного `disableUpdate()`.
2. **Обновление сложных объектов «на месте»**
   - Если храните объект, при изменении создавайте новый объект (`{ ...prev, changed }`) в функц. сеттере.
3. **Забыли включить реактивность**
   - Если UI не обновляется, проверьте, что вызвали `enableUpdate()` (или `enableUpdate(true)`).

---

## Типизация

**Экспортируемые типы**

- `UseRefStateActions`
   - Методы управления реактивностью:
      - `disableUpdate(): void` — отключает обновления состояния.
      - `enableUpdate(forceUpdate?: boolean): void` — включает обновления, при `forceUpdate: true` принудительно вызывает ререндер.

- `UseRefStateDispatch<ValueType>`
   - Функциональный апдейтер: `(prevState: ValueType) => ValueType`.

- `UseRefStateReturn<ValueType>`
   - Кортеж: `[stateRef: MutableRefObject<ValueType>, setRefState: (value: ValueType | UseRefStateDispatch<ValueType>) => void, actions: UseRefStateActions]`.

---

## Смотрите также

- [useDemandStructure](useDemandStructure.md)
