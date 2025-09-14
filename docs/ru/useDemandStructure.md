# `useDemandStructure`

## Описание

`useDemandStructure` — «системный» хук для **ленивой оценки** значений и **треккинга факта доступа** к ним. Он строит объект/кортеж, где каждое поле — это *getter*, вызывающий соответствующий `accessor` **при каждом чтении**. Дополнительно к результату прикрепляется служебный символ `$DemandStructureUsingSymbol` с картой использованных полей.

Хук в первую очередь предназначен для **реализации других хуков** (как инфраструктурная деталь): например, чтобы
- формировать гибридный результат (и кортеж, и объект с алиасами),
- включать реактивность **только если** конкретное поле реально читали.

---

## Сигнатура

```ts
// A) Массив аксессоров (кортеж без имён)
function useDemandStructure<
  const AccessorArray extends readonly UseDemandStructureAccessor<any>[]
>(
  accessors: readonly [...AccessorArray],
): UseDemandStructureReturnBase<{
  [Key in keyof AccessorArray]: AccessorArray[Key] extends UseDemandStructureAccessor<infer R> ? R : never;
}>;

// B) Массив с алиасами (гибрид: индексы + имена)
function useDemandStructure<
  const AccessorArray extends ReadonlyArray<UseDemandStructureAccessorWithAlias<any>>
>(
  accessors: AccessorArray,
): UseDemandStructureReturnBase<
  { [I in keyof AccessorArray]: AccessorArray[I] extends UseDemandStructureAccessorWithAlias<infer V> ? V : never } &
  { readonly [Item in AccessorArray[number] as Item['alias']]: Item extends UseDemandStructureAccessorWithAlias<infer V> ? V : never }
>;

// C) Объект аксессоров (только имена)
function useDemandStructure<
  const AccessorObject extends { readonly [key: string]: UseDemandStructureAccessor }
>(
  accessors: AccessorObject,
): UseDemandStructureReturnBase<{ [K in keyof AccessorObject]: ReturnType<AccessorObject[K]> }>;
```

- **Параметры**
   - `accessors` — набор функций (или `{ alias, accessor }`), которые вычисляют значения «по требованию».

- **Возвращает**: `UseDemandStructureReturnBase<…>` — лениво вычисляемую структуру:
   - числовые индексы и/или именованные свойства (в зависимости от формы);
   - служебный символ `$DemandStructureUsingSymbol` с картой использованных ключей.

---

## Примеры

### 1) Гибрид: индексы + алиасы

```tsx
import { useDemandStructure } from '@webeach/react-hooks/useDemandStructure';

type DemoHybridProps = {
  count: number;
}

export function DemoHybrid(props: DemoHybridProps) {
  const { count } = props;
  
  const result = useDemandStructure([
    {
      alias: 'value',
      accessor: () => count,
    },
    {
      alias: 'double',
      accessor: () => count * 2,
    },
  ]);

  // Доступ по индексу
  const first = result[0]; // == count

  // Доступ по алиасу
  const x2 = result.double; // == count * 2

  return <div>{first} → {x2}</div>;
}
```

### 2) Объектная форма и ленивые вычисления

```tsx
const metrics = useDemandStructure({
  now: () => Date.now(),
  heavy: () => expensiveCompute(), // выполнится только при чтении metrics.heavy
});

console.log(metrics.now);
// ...при этом expensiveCompute не вызван, пока не обратимся к metrics.heavy
```

### 3) Трекинг использования для условной реактивности

```tsx
import { $DemandStructureUsingSymbol } from '@webeach/react-hooks/useDemandStructure';

function useVisibilityWithOptIn(forceUpdate: () => void) {
  const state = useDemandStructure([
    {
      alias: 'isVisible',
      accessor: () => {
        return document.visibilityState === 'visible';
      },
    },
  ]);

  // где‑то в обработчике:
  const used = state[$DemandStructureUsingSymbol].isVisible;
  if (used) {
    forceUpdate(); // обновляем только если поле реально использовали
  }

  return state;
}
```

---

## Поведение

1. **Ленивая оценка**
   - Каждый accessor вызывается **при каждом чтении** соответствующего свойства.

2. **Трекинг использования**
   - В `[$DemandStructureUsingSymbol]` записывается `true` для ключа (индекса/алиаса/имени), когда к нему обращаются.

3. **Гибридные структуры**
   - Массив с алиасами даёт доступ и по индексу, и по имени. Добавлены `length` и `Symbol.iterator` для работы как с массивом.

4. **Стабильность результата**
   - Возвращаемый объект стабилен по ссылке между рендерами; актуальные accessor’ы берутся через «живой» `ref`.

5. **Без кэширования значений**
   - Значения **не мемоизируются** автоматически. Если вычисление тяжёлое и часто читается — оборачивайте логику в `useMemo` **внутри** accessor’а.

6. **SSR‑безопасность**
   - Сам по себе хук не обращается к DOM; используйте браузерные API внутри accessor’ов только в эффектах/layout‑эффектах.

---

## Когда использовать

- Построение «гибридных» API хуков (и кортеж, и объект с именами) без дублирования вычислений.
- Тонкая оптимизация: включать перерисовки/обновления **только при фактическом использовании** конкретных полей.
- Инфраструктура библиотечных хуков и внутренних утилит.

---

## Когда **не** использовать

- В прикладных компонентах, когда достаточно обычных `useMemo`/`useState`.
- Если значения тяжело вычислять и их читают постоянно — используйте явную мемоизацию.
- Когда важны простота и прозрачность — избыточная абстракция может усложнить отладку.

---

## Частые ошибки

1. **Передача значения вместо функции**
   - В `accessors` должны быть **функции**. `() => value`, а не сам `value`.

2. **Ожидание кэширования**
   - `useDemandStructure` не запоминает результат. Если нужен кэш — добавляйте `useMemo`/локальный кэш внутри accessor’а.

3. **Конфликты алиасов/индексов**
   - Убедитесь, что `alias` уникален и не пересекается с числовыми индексами.

---

## Типизация

- **Экспортируемые типы**
  - `UseDemandStructureReturnBase<ObjectType>` — базовый тип результата со служебным символом использования.
  - `UseDemandStructureAccessor<ValueType>` — сигнатура аксессора (получает флаг «первый доступ»).
  - `UseDemandStructureAccessorWithAlias<ValueType>` — элемент массива с именованным полем `alias` и функцией `accessor`.

---

## Смотрите также

- [useRefState](useRefState.md)
