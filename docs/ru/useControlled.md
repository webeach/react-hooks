# `useControlled`

## Описание

`useControlled` — хук для управления значением в двух режимах: **контролируемом** (от внешнего `value`) и **неконтролируемом** (внутреннее состояние на базе `defaultValue`). Хук возвращает *гибридную* структуру, поддерживающую **кортежную** и **объектную** деструктуризацию:

- Кортеж: `[value, setValue, isControlled]`
- Объект: `{ value, setValue, isControlled }`

---

## Сигнатура

```ts
function useControlled<ValueType>(
  defaultValue: ValueType | (() => ValueType) | undefined,
  value: ValueType | undefined,
): UseControlledReturn<ValueType>;
```

- **Параметры**
  - `defaultValue` — начальное значение **для неконтролируемого** режима. Можно передать функцию‑инициализатор для ленивой инициализации.
  - `value` — **контролируемое** значение. Если `value !== undefined`, хук работает в контролируемом режиме.

- **Возвращает**: `UseControlledReturn<ValueType>` — гибридная структура:
  - `value: ValueType | undefined` — текущее значение (внешнее или внутреннее);
  - `setValue(nextValue: ValueType): void` — обновляет значение **только** в неконтролируемом режиме (в контролируемом — no‑op);
  - `isControlled: boolean` — признак контролируемого режима.

---

## Примеры

### 1) Компонент `<Toggle>`

```tsx
import { useControlled } from '@webeach/react-hooks/useControlled';

export type ToggleProps = {
  value?: boolean; // если undefined — неконтролируемый режим
  defaultValue?: boolean; // используется только при uncontrolled
  onChange?: (next: boolean) => void;
};

export function Toggle(props: ToggleProps) {
  const { value, defaultValue, onChange } = props;
  
  const state = useControlled<boolean>(defaultValue, value);

  const handleClick = () => {
    state.setValue(!state.value);
    onChange?.(!state.value);
  };

  return (
    <button aria-pressed={Boolean(state.value)} onClick={handleClick}>
      {state.value ? 'On' : 'Off'}
    </button>
  );
}
```

### 2) Компонент `<Modal>` с пропсами `defaultVisible` и `visible`

```tsx
import { type ReactNode } from 'react';
import { useControlled } from '@webeach/react-hooks/useControlled';

export type ModalProps = {
  visible?: boolean;           // контролируемый режим, если задано
  defaultVisible?: boolean;    // стартовое значение для неконтролируемого режима
  onVisibleChange?: (v: boolean) => void;
  title?: string;
  children?: ReactNode;
};

export function Modal(props: ModalProps) {
  const { children, visible, defaultVisible, onVisibleChange } = props;
  
  const visibilityState = useControlled<boolean>(defaultVisible, visible);

  const setVisible = (next: boolean) => {
    // можно вызывать без проверки isControlled — в controlled это no-op внутри, но событие уведомит родителя
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
          <button aria-label="Close" onClick={() => setVisible(false)}>×</button>
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
   - Значение считается контролируемым, если `value !== undefined`. Значение `null` трактуется как контролируемое.

2. **Актуальное значение**
   - В контролируемом режиме используется внешнее `value`; в неконтролируемом — внутреннее значение, инициализируемое из `defaultValue` (поддерживается ленивая инициализация через функцию).

3. **Работа `setValue`**
   - Меняет значение только в неконтролируемом режиме; в контролируемом — no‑op.
   - `setValue` можно вызывать без проверки `isControlled`; в контролируемом режиме вызов **не** приведёт к изменению значения и **не** вызовет перерисовку.

4. **Переход между режимами**
   - При переходе из контролируемого в неконтролируемый после маунта сохраняется последнее контролируемое значение, чтобы не терять состояние.

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
   - Режим определяется строго по `value !== undefined`. Значение `null` трактуется как *контролируемое*. Если нужен неконтролируемый режим, передавайте `value: undefined`.

3. **Дерганый переход между режимами**
   - Частое переключение controlled/uncontrolled усложняет логику и UX. Предпочтительнее фиксировать режим на время жизни компонента.

4. **Потеря значения при переключении**
   - Убедитесь, что внешняя логика корректно снабжает компонент последним значением при переходе в контролируемый режим и обрабатывает его при обратном переходе.

5. **Неверное использование ленивой инициализации**
   - Не оборачивайте простое значение в функцию без необходимости — это усложняет чтение. Функция нужна только для дорогой инициализации.

---

## Типизация

**Экспортируемые типы**

- `UseControlledReturn<ValueType>`
  - Гибрид: кортеж `[value: ValueType | undefined, setValue: (next: ValueType) => void, isControlled: boolean]` **и** объект `{ value: ValueType | undefined; setValue: (next: ValueType) => void; isControlled: boolean }`.

- `UseControlledReturnObject<ValueType>`
  - Объектная форма: `{ value: ValueType | undefined; setValue: (next: ValueType) => void; isControlled: boolean }`.

- `UseControlledReturnTuple<ValueType>`
  - Кортежная форма: `[value: ValueType | undefined, setValue: (next: ValueType) => void, isControlled: boolean]`. 

---

## Смотрите также

- [useBoolean](useBoolean.md)
- [useNumber](useNumber.md)
- [useToggle](useToggle.md)
