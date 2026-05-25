# `useControlled`

## Описание

`useControlled` — хук для управления значением в двух режимах: **контролируемом** (от внешнего `value`) и **неконтролируемом** (внутреннее состояние, инициализированное из `defaultValue`).

Результат — _гибридная_ структура, поддерживающая **кортежную** и **объектную** деструктуризацию:

- Кортеж: `[value, setValue, isControlled]`
- Объект: `{ value, setValue, isControlled }`

`setValue` принимает либо значение, либо функцию‑апдейтер `(prev) => next` — как сеттер обычного `useState`.

---

## Сигнатура

```ts
function useControlled<ValueType>(
  defaultValue: ValueType | (() => ValueType),
  value?: NoInfer<ValueType>,
): UseControlledReturn<ValueType>;
```

- **Параметры**
  - `defaultValue` — начальное значение для **неконтролируемого** режима. Можно передать функцию‑инициализатор (`() => ValueType`) для ленивой инициализации.
  - `value` — опциональное **контролируемое** значение. Если `value !== undefined`, хук работает в контролируемом режиме.

- **Возвращает**: `UseControlledReturn<ValueType>` — гибридная структура:
  - `value: ValueType` — текущее значение (внешнее или внутреннее);
  - `setValue(nextValue): void` — обновляет значение **только** в неконтролируемом режиме (в контролируемом — no‑op). Принимает либо значение, либо функцию `(prev) => next`;
  - `isControlled: boolean` — признак контролируемого режима.

### Инференция типов

`ValueType` выводится **только** из `defaultValue`:

- `useControlled('default', value)` → `ValueType = string`, `value: string`
- `useControlled(0, value)` → `ValueType = number`, `value: number`
- `useControlled<string | undefined>(undefined, value)` → `ValueType = string | undefined`, `value: string | undefined`

Если нужен полностью опциональный тип (без дефолта), укажите его явно через дженерик.

---

## Примеры

### 1) Компонент `<Toggle>`

```tsx
import { useControlled } from '@webeach/react-hooks';

export type ToggleProps = {
  value?: boolean; // если undefined — неконтролируемый режим
  defaultValue?: boolean; // используется только в uncontrolled-режиме
  onChange?: (next: boolean) => void;
};

export function Toggle(props: ToggleProps) {
  const { value, defaultValue = false, onChange } = props;

  const state = useControlled(defaultValue, value);

  const handleClick = () => {
    const next = !state.value;
    state.setValue(next);
    onChange?.(next);
  };

  return (
    <button aria-pressed={state.value} onClick={handleClick}>
      {state.value ? 'On' : 'Off'}
    </button>
  );
}
```

### 2) Счётчик с функциональным обновлением

```tsx
import { useControlled } from '@webeach/react-hooks';

export function Counter({ value }: { value?: number }) {
  const [count, setCount] = useControlled(0, value);

  return (
    <div>
      <button onClick={() => setCount((prev) => prev - 1)}>−</button>
      <span>{count}</span>
      <button onClick={() => setCount((prev) => prev + 1)}>+</button>
    </div>
  );
}
```

### 3) Компонент `<Modal>` с пропсами `defaultVisible` и `visible`

```tsx
import { type ReactNode, useState } from 'react';
import { useControlled } from '@webeach/react-hooks';

export type ModalProps = {
  visible?: boolean; // контролируемый режим, если задано
  defaultVisible?: boolean; // стартовое значение для неконтролируемого режима
  onVisibleChange?: (v: boolean) => void;
  title?: string;
  children?: ReactNode;
};

export function Modal(props: ModalProps) {
  const { children, visible, defaultVisible = false, onVisibleChange } = props;

  const visibilityState = useControlled(defaultVisible, visible);

  const setVisible = (next: boolean) => {
    // в controlled это no-op внутри, но событие уведомит родителя
    visibilityState.setValue(next);
    onVisibleChange?.(next);
  };

  if (!visibilityState.value) {
    return null;
  }

  return (
    <div role="dialog" aria-modal="true" className="backdrop">
      <div className="modal">
        <header className="modal__header">
          <h2 className="modal__title">{props.title}</h2>
          <button aria-label="Close" onClick={() => setVisible(false)}>
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

// Использование:
// 1) Неконтролируемый режим
// <Modal defaultVisible={false} onVisibleChange={(open) => console.log(open)} title="Hello" />
// 2) Контролируемый режим
// function Page() {
//   const [open, setOpen] = useState(false);
//   return (
//     <>
//       <button onClick={() => setOpen(true)}>Open</button>
//       <Modal visible={open} onVisibleChange={setOpen} title="Hello">content</Modal>
//     </>
//   );
// }
```

---

## Поведение

1. **Определение режима**
   - Хук считается контролируемым, если `value !== undefined`. Значение `null` трактуется как контролируемое.

2. **Актуальное значение**
   - В контролируемом режиме используется внешнее `value`.
   - В неконтролируемом — внутреннее значение, инициализированное из `defaultValue` (поддерживается ленивая инициализация через функцию).

3. **Работа `setValue`**
   - В неконтролируемом режиме: меняет внутреннее значение. Принимает значение или функцию‑апдейтер `(prev) => next`.
   - В контролируемом режиме: **no‑op** — не вызывает перерисовку. Безопасно вызывать без проверки `isControlled`; для проброса значения наружу комбинируйте с родительским `onChange`.

4. **Переход между режимами**
   - При переходе из контролируемого в неконтролируемый после маунта сохраняется последнее контролируемое значение. Работает корректно и для falsy‑значений (`0`, `''`, `false`).
   - Безопасно работает под React `<StrictMode>`: восстановление срабатывает только при настоящем переходе controlled → uncontrolled, а не на dev‑mode двойном маунте.

5. **Гибридный доступ**
   - Результат можно использовать как кортеж `[value, setValue, isControlled]` или как объект `{ value, setValue, isControlled }`.

---

## Когда использовать

- Нужна единая реализация компонента, поддерживающая **оба режима**: controlled/uncontrolled.
- Компоненты ввода (input, select, checkbox), переключатели, раскрывающиеся панели.
- Постепенный переход от локального состояния к внешнему управлению (или наоборот).

---

## Когда **не** использовать

- Если компонент по дизайну всегда **строго контролируемый** — избыточно держать внутреннее состояние.
- Если требуется сложная логика изменений — рассмотрите `useReducer` или специализированный хук.

---

## Частые ошибки

1. **Ожидание, что `setValue` изменит контролируемое значение**
   - В контролируемом режиме `setValue` — no‑op. Изменения инициируются внешним пропом (например, через `onChange`).

2. **Смешение `null` и `undefined`**
   - Режим определяется строго по `value !== undefined`. Значение `null` трактуется как _контролируемое_. Если нужен неконтролируемый режим, передавайте `value: undefined`.

3. **Ожидание `value` типа `T | undefined`, когда задан `defaultValue`**
   - Если `defaultValue` есть, возвращаемый `value` имеет тип `ValueType` (всегда определён). Чтобы разрешить `undefined`, явно укажите дженерик: `useControlled<string | undefined>(undefined, controlled)`.

4. **Неверное использование ленивой инициализации**
   - Оборачивайте `defaultValue` в функцию, только если вычисление дорогое: `useControlled(() => expensiveInit(), value)`.

---

## Типизация

**Экспортируемые типы**

- `UseControlledReturn<ValueType>`
  - Гибрид: кортеж `[value: ValueType, setValue, isControlled: boolean]` **и** объект `{ value: ValueType; setValue; isControlled: boolean }`.

- `UseControlledReturnObject<ValueType>`
  - Объектная форма: `{ value: ValueType; setValue: (next: ValueType | ((prev: ValueType) => ValueType)) => void; isControlled: boolean }`.

- `UseControlledReturnTuple<ValueType>`
  - Кортежная форма: `[value: ValueType, setValue: (next: ValueType | ((prev: ValueType) => ValueType)) => void, isControlled: boolean]`.

---

## Смотрите также

- [useBoolean](useBoolean.md)
- [useNumber](useNumber.md)
- [useToggle](useToggle.md)
