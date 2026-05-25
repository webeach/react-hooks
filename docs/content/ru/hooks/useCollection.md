# `useCollection`

## Описание

`useCollection` — хук‑обёртка над [`@webeach/collection`](https://github.com/webeach/collection). Под капотом создаёт **стабильный экземпляр `Collection`** и возвращает:

- **реактивный снимок** элементов — компонент перерисовывается при любых изменениях коллекции;
- **стабильный фасад `methods`** — узкий публичный набор методов (`appendItem`, `patchItem`, `removeItem` и т.д.). Ссылки на методы не меняются между рендерами — их безопасно передавать в пропсы и в зависимости эффектов.

Сам экземпляр `Collection` (и его API подписки) намеренно скрыт — подпиской на обновления хук управляет за вас.

Поддерживает три формы вызова: **объект опций**, **массив начальных элементов** или **ленивая функция‑инициализатор** (как `useState((init) => ...)`).

---

## Сигнатура

```ts
// 1) Объект опций (initialItems как массив или функция)
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  options?: UseCollectionOptions<PrimaryKey, PrimaryKeyType, ItemData>,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

// 2) Массив начальных элементов
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  initialItems?: ReadonlyArray<ItemData>,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

// 3) Ленивая фабрика начальных элементов
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  initialItemsFactory: UseCollectionInitialItemsFactory<
    PrimaryKey,
    PrimaryKeyType,
    ItemData
  >,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;
```

- **Параметры**
  - `options?` — опции коллекции (кастомный `primaryKey`, хуки, и `initialItems` как массив или фабрика).
  - `initialItems?` — массив элементов (с дефолтным первичным ключом `"key"`).
  - `initialItemsFactory` — функция `() => items[]`, вызывается **один раз** на первом рендере.

- **Возвращает**: `UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>` — кортеж:
  - `state` — `ReadonlyArray<ItemData>`, реактивный снимок текущих элементов;
  - `methods` — стабильный фасад с методами для мутаций и запросов.

### Методы, доступные в `methods`

`appendItem`, `appendItemAt`, `clear`, `getItem`, `hasItem`, `insertItemAfter`, `insertItemBefore`, `patchItem`, `prependItem`, `removeItem`, `replaceItem`, `reset`, `setItems`.

Геттеры (`items`, `numItems`) и API подписки (`addEventListener` / `removeEventListener`) намеренно не экспонируются — для чтения используйте `state` (и `state.length`).

---

## Примеры

### 1) Базовое использование: список задач (тип инферится)

```tsx
import { useCollection } from '@webeach/react-hooks';

export function TodoList() {
  const [tasks, { appendItem, patchItem, removeItem }] = useCollection([
    { key: 't1', title: 'Написать доку', done: false },
    { key: 't2', title: 'Прочекать PR', done: true },
  ]);

  const add = () => {
    appendItem({
      key: crypto.randomUUID(),
      title: 'Новая задача',
      done: false,
    });
  };

  return (
    <div>
      <button onClick={add}>Добавить</button>
      <ul>
        {tasks.map((item) => (
          <li key={item.key}>
            <label>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => patchItem(item.key, { done: !item.done })}
              />
              {item.title}
            </label>
            <button onClick={() => removeItem(item.key)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2) Кастомный первичный ключ `id: number` через опции

```tsx
import { useCollection } from '@webeach/react-hooks';

type UserData = {
  id: number;
  name: string;
};

export function Users() {
  const [users, { patchItem, setItems }] = useCollection<
    'id',
    number,
    UserData
  >({
    primaryKey: 'id',
    initialItems: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  });

  const rename = (id: number, name: string) => {
    patchItem(id, { name });
  };

  const reloadAll = async () => {
    const next = await fetch('/api/users').then((response) => response.json());
    setItems(next); // полная замена содержимого
  };

  return (
    <>
      <button onClick={reloadAll}>Reload</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  );
}
```

### 3) Ленивая инициализация тяжёлого seed-а

```tsx
import { useCollection } from '@webeach/react-hooks';

function buildHeavyList() {
  // Дорогое вычисление — выполнится только на первом рендере.
  return Array.from({ length: 10_000 }, (_, index) => ({
    key: `row-${index}`,
    label: `Row ${index}`,
  }));
}

export function HugeTable() {
  const [rows, { setItems }] = useCollection(() => buildHeavyList());
  // ...
}
```

Внутри `options` тоже можно передать функцию:

```tsx
useCollection({
  primaryKey: 'id',
  initialItems: () => buildHeavyList(),
});
```

---

## Поведение

1. **Стабильность ссылок на методы**
   - Каждый метод в `methods` имеет постоянную ссылку. Можно передавать в зависимости эффектов и в пропсы без `useCallback`.

2. **Реактивный снимок**
   - `state` — иммутабельный `ReadonlyArray`. Каждая мутация публикует новый снимок и перерисовывает компонент.

3. **Ленивая инициализация**
   - Когда `initialItems` передан как функция (отдельно или внутри `options`) — он вызывается **один раз** на первом рендере.

4. **Скрытая подписка**
   - Подпиской на события коллекции управляет хук — со стороны компонента ничего подписывать или чистить не нужно.

5. **SSR‑безопасность**
   - Хук не обращается к браузерным API и безопасен для SSR/ISR.

---

## Когда использовать

- Нужно хранить список/коллекцию с частыми вставками, удалениями и обновлениями.
- Нужны **стабильные ссылки на методы** для передачи в детей без оборачивания в `useCallback`.
- Важна типобезопасность по первичному ключу и форме данных элемента.

---

## Когда **не** использовать

- Изменения редки — хватит обычного `useState` с массивом или объектом.
- Нужен доступ к raw-событиям `Collection` или другим внутренностям — используйте `@webeach/collection` напрямую и сами интегрируйте с React.
- Требуется сложная бизнес‑логика поверх коллекции (история, транзакции) — выносите в отдельный слой.

---

## Частые ошибки

1. **Мутация элементов «на месте»**
   - Прямое изменение полей объекта не вызовет перерисовку. Используйте `methods.patchItem` / `replaceItem` / `setItems`.

2. **Ожидание, что `initialItems` обновится автоматически**
   - Коллекция создаётся один раз. Изменение переменной `initialItems` после монтирования игнорируется — вызывайте `methods.reset()` или `methods.setItems(next)`.

3. **Поиск `addEventListener` в `methods`**
   - Не экспонируется намеренно. Подпиской владеет хук. Если нужен прямой доступ к событиям — используйте `@webeach/collection` напрямую.

4. **Создание новых опций на каждом рендере**
   - Коллекция инициализируется один раз. Новые опции между рендерами игнорируются (это by design — гарантия стабильности экземпляра).

---

## Типизация

**Экспортируемые типы**

- `UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>` — кортеж `[state, methods]`.
- `UseCollectionMethods<PrimaryKey, PrimaryKeyType, ItemData>` — тип фасада с методами (вторая позиция кортежа).
- `UseCollectionOptions<PrimaryKey, PrimaryKeyType, ItemData>` — расширенные опции, принимающие `initialItems` массивом или функцией.
- `UseCollectionInitialItemsFactory<PrimaryKey, PrimaryKeyType, ItemData>` — `() => ReadonlyArray<ItemData>`.

**Параметры дженериков**

- `PrimaryKey extends string = 'key'` — имя поля первичного ключа в данных.
- `PrimaryKeyType = CollectionDefaultKeyType` — тип значения первичного ключа (`string | number | bigint`).
- `ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType>` — форма данных элемента. В большинстве случаев инферится из `initialItems`.

---

## Смотрите также

- [`@webeach/collection`](https://github.com/webeach/collection) — библиотека‑основа
- [useMap](useMap.md)
- [useSet](useSet.md)
