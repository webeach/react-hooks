# `useMemoCompare`

## Описание

`useMemoCompare` — обёртка над `useMemo`, которая пересчитывает значение **только при «логическом» изменении** зависимостей. Поддерживает три формы сравнения:

- массив зависимостей с **поверхностным сравнением** по индексам (`===`),
- **кастомная функция сравнения** и отдельное значение,
- **только функция сравнения**, если логика сравнения инкапсулирована внутри неё.

---

## Сигнатура

```ts
// 1) Массив зависимостей
function useMemoCompare<ValueType>(
  factory: () => ValueType,
  deps: unknown[],
): ValueType;

// 2) Кастомный компаратор + значение
function useMemoCompare<ValueType, ComparedValue>(
  factory: () => ValueType,
  compare: UseMemoCompareFunction<ComparedValue>,
  comparedValue: ComparedValue,
): ValueType;

// 3) Только компаратор
function useMemoCompare<ValueType>(
  factory: () => ValueType,
  compare: UseMemoCompareFunction,
): ValueType;
```

- **Параметры**
  - `factory` — функция, которая возвращает мемоизируемое значение; должна быть чистой и не иметь побочных эффектов.
  - `deps` — массив зависимостей; сравнивается **поверхностно** по индексам (`===`).
  - `compare` — функция сравнения, которая должна вернуть `true`, если значения **равны** (изменения **нет**), и `false`, если **различаются** (изменение **есть**).
  - `comparedValue` — значение для сравнения пользовательским компаратором.

- **Возвращает**
  - Мемоизированное значение типа `ValueType`.

---

## Примеры

### 1) Массив зависимостей с поверхностным сравнением

```tsx
import { useMemoCompare } from '@webeach/react-hooks/useMemoCompare';

function Products({ items, query, sort }: { items: Item[]; query: string; sort: 'asc' | 'desc' }) {
  const filtered = useMemoCompare(
    () =>
      items
        .filter((p) => p.title.includes(query))
        .sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price)),
    [items, query, sort],
  );

  return <List data={filtered} />;
}
```

### 2) Кастомный компаратор по «смыслу» объекта

```tsx
import { useMemoCompare } from '@webeach/react-hooks/useMemoCompare';

function UserBadge({ user }: { user: { id: string; name: string; role: string } | null }) {
  const view = useMemoCompare(
    () => buildUserView(user),
    (prev, next) => prev?.id === next?.id, // пересчитываем только если id сменился
    user,
  );
  return <Badge data={view} />;
}
```

### 3) Только компаратор (логика внутри функции)

```tsx
import { useMemoCompare } from '@webeach/react-hooks/useMemoCompare';

function ThemeProvider({ config }: { config: ThemeConfig }) {
  const theme = useMemoCompare(
    () => createTheme(config),
    () => config.hash === lastAppliedHash.current,
  );
  return <ThemeContext.Provider value={theme} />;
}
```

---

## Поведение

1. **Триггер пересчёта**
   - `factory` вызывается только при **детектированном изменении** зависимостей. Иначе возвращается предыдущее мемоизированное значение без пересчёта.

2. **Динамический массив зависимостей**
   - В форме с `deps` массив может быть полностью **динамическим**: длина и порядок могут меняться от рендера к рендеру. Сравнение учитывает как значения по индексам, так и длину; изменение длины тоже считается изменением. В отличие от обычного `useMemo`, **не требуется** поддерживать «строго одинаковую» длину массива между рендерами.

3. **Чистота `factory`**
   - `factory` не должна иметь побочных эффектов (сеттеры состояния, подписки, I/O). Для побочных действий используйте эффекты.

4. **Стабильность результата**
   - При отсутствии изменений возвращается **та же ссылка** на предыдущее значение (полезно для оптимизаций `React.memo`, `useEffect` и пр.).

---

## Когда использовать

- Дорогие вычисления/трансформации, зависящие от сложных объектов.
- Нормализация/индексация данных, подготовка вью‑моделей, кэшируемые селекторы.
- Когда важно пересчитывать только при **значимых** изменениях по кастомному правилу.

---

## Когда **не** использовать

- Если вычисление дешёвое — излишняя мемоизация усложняет код.
- Если нужен **колбэк**, а не значение — используйте `useCallbackCompare`.
- Для сайд‑эффектов — используйте `useEffectCompare`/`useLayoutEffectCompare`.

---

## Частые ошибки

1. **Инвертированная логика компаратора**
   - Компаратор должен возвращать `true` при равенстве и `false` при различии. Иная семантика приведёт к лишним/пропущенным пересчётам.

2. **Побочные эффекты внутри `factory`**
   - Не вызывайте `setState`, не подписывайтесь и не обращайтесь к внешним эффектам из `factory`.

3. **Залежалые замыкания**
   - Если `factory` использует внешние значения, обеспечьте их актуальность (через параметры, `ref` или корректные сравнения), иначе получите устаревшие данные.

4. **Неподходящий ключ сравнения**
   - В форме с компаратором убедитесь, что используете правильный критерий «значимости» (например, `id` вместо всей ссылки объекта).

---

## Типизация

- `UseMemoCompareFunction<ValueType>`
  - Универсальный тип компаратора:
  - `ValueType` указан → `(prev: ValueType, next: ValueType) => boolean` (верните `true`, если **равны**).
  - `ValueType` не указан → `() => boolean` (вся логика сравнения — внутри функции).

---

## Смотрите также

- [useCallbackCompare](useCallbackCompare.md)
- [useEffectCompare](useEffectCompare.md)
- [useMemoCompare](useMemoCompare.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
