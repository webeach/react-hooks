# `usePatchDeepState`

## Описание

`usePatchDeepState` — хук для управления **объектным состоянием** с поддержкой **глубоких частичных обновлений** (deep‑merge) по plain‑объектам. Принимает частичный объект или функцию‑апдейтер и объединяет патч **рекурсивно**: plain‑объекты сливаются, а массивы/функции/классы и прочие неплоские значения — **заменяются целиком**.

> Примечание: для простых кейсов с одной вложенностью часто достаточно `usePatchState` (поверхностный merge).

---

## Сигнатура

```ts
function usePatchDeepState<ObjectType extends PlainObject>(
  initialState: ObjectType | (() => ObjectType),
): readonly [state: ObjectType, patch: UsePatchDeepStateFunction<ObjectType>];
```

- **Параметры**
   - `initialState` — начальный объект состояния или функция‑инициализатор (ленивая инициализация).

- **Возвращает**
   - Кортеж `[state, patch]`:
      - `state: ObjectType` — текущее состояние;
      - `patch(partial | updater): void` — глубокий патч состояния (см. поведение).

---

## Примеры

### 1) Глубокий патч вложенных полей

```tsx
import { usePatchDeepState } from '@webeach/react-hooks/usePatchDeepState';

type State = {
  user: { name: string; meta: { age: number; city?: string } };
  ui: { theme: { mode: 'light' | 'dark'; accent: string } };
};

export function Profile() {
  const [state, patch] = usePatchDeepState<State>(() => ({
    user: {
      name: 'Alice',
      meta: {
        age: 25,
      }
    },
    ui: {
      theme: {
        mode: 'light',
        accent: '#09f',
      },
    },
  }));

  // Обновим только возраст и цвет темы — остальные поля сохранятся
  const apply = () => {
    patch({
      user: {
        meta: {
          age: 30,
        },
      },
      ui: {
        theme: {
          accent: '#f90',
        },
      },
    });
  };

  return (
    <div>
      <button onClick={apply}>Apply</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```

### 2) Функциональный апдейтер (зависимость от предыдущего состояния)

```tsx
import { usePatchDeepState } from '@webeach/react-hooks/usePatchDeepState';

type Basket = { items: Array<{ id: string; qty: number }>; meta: { total: number } };

export function Cart() {
  const [state, patch] = usePatchDeepState<Basket>(() => ({
    items: [],
    meta: {
      total: 0,
    },
  }));

  const add = (id: string) => {
    patch((prev) => ({
      items: [...prev.items, { id, qty: 1 }], // массивы заменяются новой ссылкой
      meta: {
        total: prev.meta.total + 1,
      },
    }));
  };

  const increment = (id: string) => {
    patch((prev) => ({
      items: prev.items.map((x) => (x.id === id ? {...x, qty: x.qty + 1} : x)),
      meta: {
        total: prev.meta.total + 1,
      },
    }));
  };

  return (
    <div>
      <button onClick={() => add('p1')}>Add p1</button>
      <button onClick={() => increment('p1')}>Increment p1</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```

### 3) Настройки: частичная синхронизация с сервером

```tsx
import { usePatchDeepState } from '@webeach/react-hooks/usePatchDeepState';

type Settings = {
  flags: { beta: boolean; analytics: boolean };
  profile: { name: string; contacts: { email?: string; phone?: string } };
};

type SettingsSyncProps = {
  fetchPatch: () => Promise<Partial<Settings>>;
};

export function SettingsSync(props: SettingsSyncProps) {
  const { fetchPatch } = props;
  
  const [settings, patch] = usePatchDeepState<Settings>({
    flags: { beta: false, analytics: true },
    profile: { name: 'Anon', contacts: {} },
  });

  const sync = async () => {
    const remote = await fetchPatch(); // частичный объект с серверной стороны
    patch(remote); // глубокое слияние
  };

  return (
    <div>
      <button onClick={sync}>Sync</button>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
    </div>
  );
}
```

---

## Поведение

1. **Глубокое слияние только для plain‑объектов**
   - Plain‑объекты (созданные через `{}`/`Object.create(null)` и т.п.) сливаются **рекурсивно**.
   - Значения **не**‑plain: массивы, функции, экземпляры классов, `Date`, `Map`, `Set` и пр. — **заменяются целиком**.

2. **Два вида патча**
   - **Частичный объект**: `patch({ a: { b: 1 } })`.
   - **Функция‑апдейтер**: `patch((prev) => ({ a: { b: prev.a.b + 1 } }))` — удобна, когда новое значение зависит от предыдущего.

3. **Отсутствие мутаций входных значений**
   - Ни предыдущее состояние, ни патч **не мутируются** — создаются новые объекты там, где это требуется.

4. **Стабильность `patch`**
   - Функция патча мемоизирована и **стабильна** между рендерами; её безопасно использовать в зависимостях эффектов/колбэков.

5. **Ленивая инициализация**
   - Если `initialState` — функция, она вызывается **один раз** на первом рендере.

6. **Производительность**
   - Deep‑merge дороже поверхностного. Старайтесь делать патчи **узкими** и по возможности хранить сильно вложенные структуры более плоско. Для одноуровневых обновлений используйте `usePatchState`.

---

## Когда использовать

- Настройки/конфиги, где часто обновляются **вложенные** поля.
- Слияние частичных данных с сервера с локальным состоянием.
- Формы со вложенными группами полей, где удобно обновлять ветку целиком.

---

## Когда **не** использовать

- Когда достаточно поверхностного объединения — выбирайте `usePatchState`.
- Если структура очень глубокая/большая и патчи затрагивают много веток — рассмотрите нормализацию данных или `useReducer`.
- Если состояние — не объект или «плоское» — проще `useState`.

---

## Частые ошибки

1. **Ожидание глубокого мерджа массивов**
   - Массивы **не** сливаются поэлементно. Передавайте новую ссылку массива: `patch((prev) => ({ list: [...prev.list, item] }))`.

2. **Мутация предыдущего состояния**
   - Не изменяйте `prev` по месту в апдейтере. Всегда возвращайте новый фрагмент с нужными вложенными объектами/массивами.

3. **Передача события как патча**
   - Не пишите `onChange={patch}` — в патч попадёт объект события. Оборачивайте: `onChange={(event) => patch({ field: event.target.value })}`.

4. **Возврат не‑объекта из апдейтера**
   - Апдейтер должен вернуть **частичный объект**; `undefined`/примитивы некорректны.

5. **Случайная перезапись ветки**
   - Если в патче у ключа — **не** plain‑объект (например, массив или функция), текущая ветка будет **заменена** целиком. Убедитесь, что это ожидаемое действие.

6. **Чрезмерно большие патчи**
   - Чем больше веток вы меняете за раз, тем дороже слияние. Разделяйте обновления при необходимости.

---

## Типизация

**Экспортируемые типы**

- `UsePatchDeepStateFunction<ObjectType extends PlainObject = PlainObject>`
   - Функция для глубокого обновления состояния-объекта.
   - Принимает:
     - Частичный объект: `Partial<ObjectType>`.
     - Или функциональный апдейтер: `(currentState: ObjectType) => Partial<ObjectType>`.
   - Возвращает `void`.

---

## Смотрите также

- [useDebounceState](useDebounceState.md)
- [usePatchState](usePatchState.md)
- [useThrottleState](useThrottleState.md)
