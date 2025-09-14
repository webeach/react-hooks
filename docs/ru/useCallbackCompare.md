# `useCallbackCompare`

## Описание

`useCallbackCompare` — обёртка над `useCallback`, которая возвращает **мемоизированный колбэк**, обновляющийся только при **«логическом» изменении** зависимостей. Поддерживает три формы:

- массив зависимостей с **поверхностным сравнением** по индексам (`===`),
- **кастомная функция сравнения** и отдельное значение,
- **только функция сравнения**, если логика сравнения инкапсулирована внутри неё.

---

## Сигнатура

```ts
// 1) Массив зависимостей
function useCallbackCompare<CallbackType extends (...args: any) => any>(
  callback: CallbackType,
  deps: unknown[],
): CallbackType;

// 2) Кастомный компаратор + значение
function useCallbackCompare<
  CallbackType extends (...args: any) => any,
  ComparedValue,
>(
  callback: CallbackType,
  compare: UseCallbackCompareFunction<ComparedValue>,
  comparedValue: ComparedValue,
): CallbackType;

// 3) Только компаратор
function useCallbackCompare<CallbackType extends (...args: any) => any>(
  callback: CallbackType,
  compare: UseCallbackCompareFunction,
): CallbackType;
```

- **Параметры**
   - `callback` — функция, которую нужно мемоизировать.
   - `deps` — массив зависимостей; сравнивается **поверхностно** по индексам (`===`).
   - `compare` — функция сравнения, которая должна вернуть `true`, если значения **равны** (изменения **нет**), и `false`, если **различаются** (изменение **есть**).
   - `comparedValue` — значение для сравнения пользовательским компаратором.

- **Возвращает**
   - Мемоизированный колбэк того же типа, что и `callback`.

---

## Примеры

### 1) Массив зависимостей: стабильный обработчик

```tsx
import { useCallbackCompare } from '@webeach/react-hooks/useCallbackCompare';

function AddToCart({ productId, qty }: { productId: string; qty: number }) {
  const handleClick = useCallbackCompare(() => {
    add(productId, qty);
  }, [productId, qty]);

  return <button onClick={handleClick}>Add</button>;
}
```

### 2) Кастомный компаратор по ключу сущности

```tsx
import { useCallbackCompare } from '@webeach/react-hooks/useCallbackCompare';

function SaveButton({ user }: { user: { id: string; name: string } }) {
  const onSave = useCallbackCompare(
    () => updateUser(user),
    (prev, next) => prev?.id === next?.id, // переопределять колбэк только если id поменялся
    user,
  );

  return <button onClick={onSave}>Save</button>;
}
```

### 3) Только компаратор: логика внутри функции

```tsx
import { useCallbackCompare } from '@webeach/react-hooks/useCallbackCompare';

// сравниваем по версии конфигурации из замыкания
function ApplyTheme({ config }: { config: ThemeConfig }) {
  const apply = useCallbackCompare(
    () => applyTheme(config),
    () => config.version === lastAppliedVersion.current,
  );

  return <button onClick={apply}>Apply theme</button>;
}
```

---

## Поведение

1. **Триггер обновления**
   - Колбэк переопределяется только при **детектированном изменении** зависимостей. Иначе сохраняется прежняя ссылочная идентичность.

2. **Динамический массив зависимостей**
   - В форме с `deps` массив может быть полностью **динамическим**: длина и порядок могут меняться от рендера к рендеру. Сравнение учитывает как значения по индексам, так и длину; изменение длины тоже считается изменением. В отличие от стандартного `useCallback`, **не требуется** поддерживать «строго одинаковую» длину массива между рендерами.

3. **Семантика компаратора**
   - Возвращайте `true`, если значения **равны** (изменения **нет**), и `false`, если **различаются** (изменение **есть**). Это определяет, будет ли создан новый колбэк.

4. **Стабильность ссылки**
   - При отсутствии изменений возвращается **та же функция** (по ссылке), что полезно для `React.memo`, зависимостей эффектов и пропов дочерним компонентам.

---

## Когда использовать

- Передача обработчиков в `React.memo`‑компоненты без лишних перерисовок.
- Когда важны **значимые** изменения зависимостей (например, по `id`), а не простая смена ссылок.
- Интеграции, где требуется **стабильная ссылка** на колбэк (подписки, виртуализация, внешние виджеты).

---

## Когда **не** использовать

- Если обычный `useCallback` с массивом зависимостей покрывает задачу.
- Когда проще хранить данные в состоянии/рефе и читать их внутри стабильного колбэка.
- Если колбэк тяжёлый сам по себе — оптимизируйте его, а не только условия пересоздания.

---

## Частые ошибки

1. **Инвертированная логика компаратора**
   - Компаратор должен возвращать `true` при равенстве и `false` при различии. Иная семантика приведёт к лишним/пропущенным пересозданиям колбэка.

2. **Залежалые замыкания**
   - Если колбэк использует значения, которые **не участвуют** в сравнении (`deps`/`comparedValue`/`compare`), он может читать устаревшие данные. Добавьте эти значения в сравнение или читайте их из `ref`.

3. **Нестабильный `comparedValue`**
   - В форме с компаратором следите, чтобы `comparedValue` не пересоздавался по пустякам (новые ссылки без смыслового изменения). Иначе колбэк будет пересоздаваться чаще, чем нужно.

---

## Типизация

**Экспортируемые типы**

- `UseCallbackCompareFunction<ValueType>`
   - `ValueType` указан → `(prev: ValueType, next: ValueType) => boolean` (верните `true`, если **равны**).
   - `ValueType` не указан → `() => boolean` (вся логика сравнения — внутри функции).

---

## Смотрите также

- [useDebounceCallback](useDebounceCallback.md)
- [useDeps](useDeps.md)
- [useEffectCompare](useEffectCompare.md)
- [useMemoCompare](useMemoCompare.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
- [useThrottleCallback](useThrottleCallback.md)
