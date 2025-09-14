# `usePatchState`

## Описание

`usePatchState` — хук для управления **объектным состоянием** с поддержкой **частичных обновлений** (патчей), похожий по идее на `this.setState` у классовых компонентов. Принимает частичный объект или функцию‑апдейтер и выполняет **поверхностное слияние** с текущим состоянием.

---

## Сигнатура

```ts
function usePatchState<ObjectType extends PlainObject>(
  initialState: ObjectType | (() => ObjectType),
): readonly [state: ObjectType, patch: UsePatchStateFunction<ObjectType>];
```

- **Параметры**
   - `initialState` — полный начальный объект состояния или функция‑инициализатор для ленивой инициализации.

- **Возвращает**
   - Кортеж `[state, patch]`:
      - `state: ObjectType` — текущее состояние;
      - `patch(partial | updater): void` — частично обновляет состояние (см. ниже).

---

## Примеры

### 1) Форма: обновление отдельных полей

```tsx
import { usePatchState } from '@webeach/react-hooks/usePatchState';

type Form = {
  name: string;
  age: number;
};

export function ProfileForm() {
  const [form, patchForm] = usePatchState<Form>({ name: '', age: 0 });

  return (
    <form>
      <input
        value={form.name}
        onChange={(event) => patchForm({ name: event.target.value })}
      />
      <input
        type="number"
        value={form.age}
        onChange={(event) => patchForm({ age: Number(event.target.value) })}
      />
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </form>
  );
}
```

### 2) Функциональный апдейт от предыдущего состояния

```tsx
import { usePatchState } from '@webeach/react-hooks/usePatchState';

type CounterState = { count: number; step: number };

export function Counter() {
  const [state, patch] = usePatchState<CounterState>({ count: 0, step: 1 });

  const increment = () => patch((prev) => ({ count: prev.count + prev.step }));
  const decrement = () => patch((prev) => ({ count: prev.count - prev.step }));
  const setStep = (step: number) => patch({ step });

  return (
    <div>
      <output>{state.count}</output>
      <button onClick={increment}>+{state.step}</button>
      <button onClick={decrement}>-{state.step}</button>
      <button onClick={() => setStep(5)}>step = 5</button>
    </div>
  );
}
```

### 3) Обновление вложенных структур (поверхностное слияние)

```tsx
import { usePatchState } from '@webeach/react-hooks/usePatchState';

type Settings = {
  theme: {
    mode: 'light' | 'dark';
    accent: string;
  };
  tags: string[];
};

export function SettingsPanel() {
  const [settings, patch] = usePatchState<Settings>(() => ({
    theme: {
      mode: 'light',
      accent: '#09f',
    },
    tags: [],
  }));

  // Важно: патч — поверхностный. Для вложенных полей создавайте новый вложенный объект или используйте хук usePatchDeepState
  const setDark = () => patch((prev) => ({ theme: { ...prev.theme, mode: 'dark' } }));
  const addTag = (t: string) => patch((prev) => ({ tags: [...prev.tags, t] }));

  return (
    <div>
      <button onClick={setDark}>Dark mode</button>
      <button onClick={() => addTag('react')}>+react</button>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
    </div>
  );
}
```

---

## Поведение

1. **Поверхностное слияние (shallow merge)**
   - Патч объединяется со состоянием через спред: новые пары ключ‑значение **перезаписывают** одноуровневые поля; вложенные объекты/массивы **не сливаются глубоко** — их нужно пересоздавать вручную в апдейтере.

2. **Два вида патча**
   - Можно передать **частичный объект** (`{ field: value }`) **или функцию‑апдейтер** `(prev) => ({ field: next })`. Функция получает текущее состояние и должна вернуть **частичный объект**.

3. **Стабильность `patch`**
   - Функция `patch` мемоизирована и **стабильна** между рендерами; её безопасно использовать в зависимостях эффектов/колбэков.

4. **Ленивая инициализация**
   - Если `initialState` — функция, она будет вызвана **один раз** при первом рендере.

5. **Иммутабельность**
   - Не мутируйте `prev` внутри апдейтера: возвращайте новый частичный объект и (при необходимости) новые вложенные структуры.

6. **Массивы**
   - Поскольку слияние поверхностное, поля‑массивы **заменяются** целиком. Для добавления/удаления элементов создавайте новый массив: `({ list: [...prev.list, x] })`.

---

## Когда использовать

- Формы, фильтры, настройки — когда удобно хранить несколько полей в одном объекте и обновлять их по мере ввода.
- Состояния, где часто меняются **отдельные** поля без пересборки всего объекта.
- Модели вида «view‑model», когда нужно быстро патчить независимые части.

---

## Когда **не** использовать

- Если состояние не объектное (числа, строки) — проще `useState`.
- Если необходимы сложные транзакционные обновления/инварианты — рассмотрите `useReducer`.
- Если требуется **глубокое** слияние по дереву — используйте хук `usePatchDeepState`.

---

## Частые ошибки

1. **Ожидание глубокого мерджа**
   - Патч объединяется **поверхностно**. Для вложенных изменений возвращайте новый вложенный объект/массив.

2. **Мутация предыдущего состояния**
   - Не изменяйте `prev` по месту внутри апдейтера — создавайте новые структуры.

3. **Передача события как патча**
   - Не пишите `onChange={patch}` — в патч попадёт объект события, что приведёт к ошибочному мерджу. Оборачивайте обработчик: `onChange={(event) => patch({ field: event.target.value })}`.

4. **Возврат не‑объекта из апдейтера**
   - Апдейтер должен вернуть **частичный объект**. Возврат `undefined`/примитива сломает логику мерджа.

5. **Случайная перезапись всего поля‑объекта**
   - `patch({ theme: { mode: 'dark' } })` перетрёт весь `theme`. Если нужно изменить одно поле, объединяйте с предыдущим: `patch((prev) => ({ theme: { ...prev.theme, mode: 'dark' } }))` или используйте хук `usePatchDeepState`.

---

## Типизация

**Экспортируемые типы**

- `UsePatchStateFunction<ObjectType extends PlainObject = PlainObject>`
   - Функция для частичного обновления состояния-объекта.
   - Принимает:
     - Частичный объект: `Partial<ObjectType>`.
     - Или функциональный апдейтер: `(currentState: ObjectType) => Partial<ObjectType>`.
   - Обновление выполняется поверхностным (shallow) объединением.
   - Возвращает `void`.

---

## Смотрите также

- [useDebounceState](useDebounceState.md)
- [usePatchDeepState](usePatchDeepState.md)
- [useThrottleState](useThrottleState.md)
