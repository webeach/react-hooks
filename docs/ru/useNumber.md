# `useNumber`

## Описание

`useNumber` — хук для управления **числовым состоянием** с удобными методами: `setValue`, `increment`, `decrement`, `reset`. Возвращает *гибридную* структуру, поддерживающую **кортежную** и **объектную** деструктуризацию.

---

## Сигнатура

```ts
function useNumber(initialValue?: number): UseNumberReturn;
```

- **Параметры**
   - `initialValue?: number` — начальное значение; по умолчанию `0`.

- **Возвращает**: `UseNumberReturn` — гибридная структура с полями/позициями:
   - `value: number` — текущее значение;
   - `setValue(newValue: number): void` — заменить значение на конкретное число;
   - `increment(step?: number): void` — увеличить на `step` (по умолчанию `1`);
   - `decrement(step?: number): void` — уменьшить на `step` (по умолчанию `1`);
   - `reset(): void` — сбросить к начальному `initialValue`.
   - кортежный доступ: `[value, setValue, increment, decrement, reset]`.

---

## Примеры

### 1) Базовый счётчик (кортеж)

```tsx
import { useNumber } from '@webeach/react-hooks/useNumber';

export function Counter() {
  const [count, setCount, inc, dec, reset] = useNumber(5);

  return (
    <div>
      <output>{count}</output>
      <button onClick={() => inc()}>+1</button>
      <button onClick={() => dec()}>-1</button>
      <button onClick={() => setCount(42)}>set 42</button>
      <button onClick={() => reset()}>reset</button>
    </div>
  );
}
```

### 2) Объектный доступ и шаги

```tsx
import { useNumber } from '@webeach/react-hooks/useNumber';

export function Stepper() {
  const counter = useNumber(0);

  return (
    <div>
      <output>{counter.value}</output>
      <button onClick={() => counter.increment(10)}>+10</button>
      <button onClick={() => counter.decrement(5)}>-5</button>
      <button onClick={() => counter.reset()}>reset</button>
    </div>
  );
}
```

### 3) Поле ввода числа

```tsx
import { useNumber } from '@webeach/react-hooks/useNumber';

export function NumericInput() {
  const state = useNumber(0);

  return (
    <label>
      <input
        type="number"
        value={state.value}
        onChange={(event) => state.setValue(Number(event.target.value))}
      />
      <button onClick={() => state.increment()}>+1</button>
      <button onClick={() => state.decrement()}>-1</button>
    </label>
  );
}
```

---

## Поведение

1. **Гибридная структура**
   - Доступны обе формы: кортеж `[value, setValue, increment, decrement, reset]` и объект `{ value, setValue, increment, decrement, reset }`.

2. **Стабильные экшены**
   - Методы `setValue`, `increment`, `decrement`, `reset` стабильны между рендерами; их безопасно указывать в зависимостях эффектов/колбэков.

3. **Шаг по умолчанию и знак**
   - Если `step` не указан — используется `1`. Отрицательное значение шага инвертирует направление (например, `increment(-2)` уменьшит на 2).

4. **Сброс к начальному значению**
   - `reset()` возвращает к **последнему** `initialValue`, переданному хуку на текущем рендере.

5. **Без ограничений по диапазону**
   - Хук не делает проверок границ. Для `min/max` добавляйте собственную обёртку (клампинг) поверх `setValue`/`increment`/`decrement`.

---

## Когда использовать

- Счётчики, количества (qty), пагинация, индексы сдвига.
- Простые числовые настройки (шаги, лимиты), когда нужны операции `+`, `−`, сброс.
- Когда удобен стабильный API с явными экшенами вместо ручных вычислений в каждом обработчике.

---

## Когда **не** использовать

- Если требуется сложная логика переходов/валидация — используйте `useReducer` или кастомный хук.
- Если нужно мемоизировать **вычисленное** значение, а не хранить состояние — используйте `useMemo`.
- Если значение должно зависеть от внешнего `value`/`defaultValue` с поддержкой обоих режимов — используйте `useControlled`.

---

## Частые ошибки

1. **Ожидание функционального сеттера**
   - `setValue` принимает **число**, а не функцию вида `(prev) => next`. Для относительных изменений используйте `increment`/`decrement`.

2. **Сброс «к нулю» вместо начального**
   - `reset()` возвращает к `initialValue`, а не обязательно к `0`.

3. **Прямая передача обработчику**
   - Не пишите `onClick={setValue}` — событие будет передано как число и приведёт к `NaN`. Используйте обёртку: `onClick={() => setValue(0)}`.

4. **Строковые значения из `<input>`**
   - `event.target.value` — строка. Преобразуйте: `Number(event.target.value)` или `parseFloat(...)`.

---

## Типизация


**Экспортируемые типы**

- `UseNumberReturn`
   - Гибридный тип возврата, объединяющий объектную и кортежную формы.

- `UseNumberReturnObject`
   - Объектная форма: `{ value: number; setValue: (value: number) => void; increment: (step?: number) => void; decrement: (step?: number) => void; reset: () => void }`.

- `UseNumberReturnTuple`
   - Кортежная форма: `[value: number, setValue: (value: number) => void, increment: (step?: number) => void, decrement: (step?: number) => void, reset: () => void]`. 

---

## Смотрите также

- [useBoolean](useBoolean.md)
- [useControlled](useControlled.md)
- [useToggle](useToggle.md)
