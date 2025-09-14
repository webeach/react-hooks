# `useCollection`

## Описание

`useCollection` — хук‑обёртка над `@webeach/collection`, который создаёт **стабильный экземпляр** `Collection` и поддерживает **реактивный снимок** его элементов. Любые мутации через методы экземпляра коллекции (например, `appendItem`, `patchItem`, `replaceItem`, `removeItem`, `setItems` и др.) автоматически обновляют возвращаемый массив‑снимок и вызывают перерисовку компонента.

Хук поддерживает две формы вызова: с **опциями** и с **начальными элементами**.

---

## Сигнатура

```ts
// 1) Через опции (в т.ч. initialItems)
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> = CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  options?: CollectionOptions<
    CollectionPrimaryKeyWithDefault<PrimaryKey>,
    PrimaryKeyType,
    ItemData
  >,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

// 2) Напрямую начальными элементами
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> = CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  initialItems?: ReadonlyArray<
    CollectionItem<
      CollectionPrimaryKeyWithDefault<PrimaryKey>,
      PrimaryKeyType,
      ItemData
    >
  >,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;
```

- **Параметры**
   - `options?` — опции `Collection` (включая `initialItems`, настройки первичного ключа и прочие параметры `@webeach/collection`).
   - `initialItems?` — массив стартовых элементов, если не нужны прочие опции.

- **Возвращает**: `UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>` — кортеж
   - `state` — `ReadonlyArray<CollectionItem<…>>`, реактивный **снимок** текущего содержимого коллекции;
   - `instance` — `Collection<…>`, **стабильный** экземпляр коллекции для вызова методов.

---

## Примеры

### 1) Базовое использование: список задач

```tsx
import { useCollection, type CollectionItem } from '@webeach/react-hooks/useCollection';

type TaskData = {
  key: string;
  title: string;
  done?: boolean;
};

export function TodoList() {
  const [tasks, tasksCollection] = useCollection<'key', string, TaskData>([
    { key: 't1', title: 'Write docs' },
    { key: 't2', title: 'Review PR', done: true },
  ]);

  const add = () => {
    tasksCollection.appendItem({
      key: crypto.randomUUID(),
      title: 'New task',
    });
  }
  
  const toggle = (item: CollectionItem<'key', string, TaskData>) => {
    tasksCollection.patchItem(item.key, { done: !item.done });
  }
  const remove = (key: string) => {
    tasksCollection.removeItem(key);
  }

  return (
    <div>
      <button onClick={add}>Add</button>
      <ul>
        {tasks.map((item) => (
          <li key={item.key}>
            <label>
              <input
                type="checkbox"
                checked={Boolean(item.done)}
                onChange={() => toggle(item)}
              />
              {item.title}
            </label>
            <button onClick={() => remove(item.key)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2) Кастомный первичный ключ `id: number` через опции

```tsx
import { useCollection } from '@webeach/react-hooks/useCollection';

type UserData = {
  id: number;
  name: string;
}

export function Users() {
  const [users, usersCollection] = useCollection<'id', number, UserData>({
    primaryKey: 'id',
    initialItems: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  });

  const rename = (id: number, name: string) => {
    usersCollection.patchItem(id, { name });
  };
  
  const reloadAll = async () => {
    const result = await fetch('/api/users').then((response) => response.json());
    usersCollection.setItems(next); // полная замена содержимого
  };

  return (
    <>
      <button onClick={reloadAll}>Reload</button>
      <ul>
        {users.map((userItem) => (
          <li key={userItem.key}>{userItem.name}</li>
        ))}
      </ul>
    </>
  );
}
```

---

## Поведение

1. **Стабильность экземпляра**
   - Возвращаемый `instance` создаётся один раз и **не меняет** ссылку между рендерами, поэтому его безопасно указывать в зависимостях эффектов и передавать в пропсы.

2. **Реактивный снимок**
   - `state` — это иммутабельный снимок (`ReadonlyArray`). Любая мутация через методы коллекции публикует новый снимок и вызывает перерисовку компонента.

3. **Инициализация**
   - Начальные данные можно задать либо массивом `initialItems`, либо через `options.initialItems`.

4. **Методы коллекции**
   - Используйте методы экземпляра (`appendItem`, `prependItem`, `appendItemAt`, `insertItemBefore/After`, `patchItem`, `replaceItem`, `removeItem`, `clear`, `reset`, `setItems`) — они гарантированно синхронизируют `state` через внутренний механизм обновления.

5. **SSR‑безопасность**
   - Хук не обращается к браузерным API и безопасен для SSR/ISR.

---

## Когда использовать

- Нужно хранить список/коллекцию с частыми вставками/удалениями/обновлениями и удобным API.
- Важно иметь **стабильный объект** коллекции для передачи между компонентами и подписок на обновления.
- Нужна типобезопасность по первичному ключу и данным элемента.

---

## Когда **не** использовать

- Изменения редки и достаточно простого `useState` с массивом/объектом.
- Требуется сложная бизнес‑логика поверх коллекции (история, транзакции) — выносите её в отдельный слой над коллекцией.

---

## Частые ошибки

1. **Мутация данных по ссылке без методов коллекции**
   - Изменение полей элемента «на месте» не опубликует новый снимок. Выполняйте обновления через методы (`patchItem`, `replaceItem`, `setItems`, и т.д.).

2. **Ожидание, что изменение `initialItems` пересоздаст коллекцию**
   - Экземпляр создаётся один раз. Изменения переменной, переданной как `initialItems`, **после маунта** не применяются автоматически — используйте методы коллекции для обновления.

3. **Зависимость от `state` для побочных действий вместо методов**
   - Реагируйте на изменения через `state`, но инициируйте сами изменения всегда через `instance`. Прямая мутация массива `state` недопустима.

4. **Неправильные зависимости эффектов**
   - Добавление `instance` в зависимости **безопасно** (ссылка стабильна). Если нужна реакция на содержимое, используйте производные значения (`state.length`, вычисления) в зависимостях.

---

## Типизация

**Экспортируемые типы**

- `UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>`
   - Кортеж `[state, instance]`, где `state` — `ReadonlyArray<CollectionItem<…>>`, а `instance` — `Collection<…>`.

- Параметры дженериков
   - `PrimaryKey extends string = 'key'` — имя поля первичного ключа в данных.
   - `PrimaryKeyType = CollectionDefaultKeyType` — тип значения первичного ключа (обычно `string | number`).
   - `ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType>` — форма данных элемента.

---

## Смотрите также

- [useMap](useMap.md)
- [useSet](useSet.md)
