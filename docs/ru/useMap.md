# `useMap`

## Описание

`useMap` — хук, создающий **реактивный** `Map`, который вызывает перерисовку компонента при мутациях (`set`, `delete`, `clear`, `replaceAll` и т.д.). Экземпляр карты **стабилен** между рендерами; начальные элементы можно передать массивом или ленивой фабрикой.

---

## Сигнатура

```ts
function useMap<KeyType = any, ValueType = any>(
  initialEntries?: ReadonlyArray<[KeyType, ValueType]> | (() => ReadonlyArray<[KeyType, ValueType]>)
): UseMapReturn<KeyType, ValueType>;
```

- **Параметры**
   - `initialEntries?` — начальные пары `[key, value]`. Поддерживается ленивый вариант: функция, возвращающая массив.

- **Возвращает**
   - Реактивную структуру, совместимую с `Map`, у которой мутации инициируют перерисовку.

---

## Примеры

### 1) Базовое использование: добавление/удаление с перерисовкой

```tsx
import { useMap } from '@webeach/react-hooks/useMap';

type User = { id: string; name: string };

export function Users() {
  const users = useMap<string, User>([
    ['u1', { id: 'u1', name: 'Alice' }],
    ['u2', { id: 'u2', name: 'Bob' }],
  ]);

  return (
    <div>
      <button onClick={() => users.set('u3', { id: 'u3', name: 'Charlie' })}>Add Charlie</button>
      <button onClick={() => users.delete('u1')}>Remove Alice</button>
      <div>Total: {users.size}</div>
      <ul>
        {users.entries().map(([id, userItem]) => (
          <li key={id}>{userItem.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2) Полная замена содержимого (`replaceAll`)

```tsx
import { useEffect } from 'react';
import { useMap } from '@webeach/react-hooks/useMap';

type CatalogProps = {
  fetchAll: () => Promise<Array<[string, Product]>>;
}

export function Catalog(props: CatalogProps) {
  const { fetchAll } = props;
  const products = useMap<string, Product>();

  useEffect(() => {
    fetchAll().then((entries) => {
      products.replaceAll(entries);
    });
  }, [fetchAll]);

  return <Grid data={products.values()} />;
}
```

### 3) Изменение вложенных значений

```tsx
import { type UseMapReturn } from '@webeach/react-hooks/useMap';

type RenameProps = {
  users: UseMapReturn<string, { name: string }>;
};

// Важно: мутация объекта по ссылке НЕ вызовет перерисовку.
// Нужно выполнить повторную запись ключа через set.
function Rename(props: RenameProps) {
  const { users } = props;
  
  const rename = (id: string, name: string) => {
    const current = users.get(id);

    if (!current) {
      return;
    }

    users.set(id, {...current, name}); // триггерит обновление
  };
  return <button onClick={() => rename('u2', 'Bobby')}>Rename Bob → Bobby</button>;
}
```

---

## Поведение

1. **Реактивность на мутациях**
   - Вызовы `set`, `delete`, `clear`, `replaceAll` инициируют перерисовку компонента.

2. **Стабильность экземпляра**
   - Возвращаемый объект сохраняет ссылочную идентичность на протяжении жизни компонента (подходит для пропов/зависимостей).

3. **Ленивая инициализация**
   - Если передать фабрику `() => entries`, начальные данные будут вычислены один раз при первом рендере.

4. **Чтение без побочных эффектов**
   - Операции `get`, `has`, `values`, `entries` не вызывают перерисовку; ререндер происходит только после мутаций.

5. **Вложенные структуры**
   - Изменение внутренних полей по ссылке (например, `users.get('u1')!.name = '…'`) не детектируется. Для обновления UI повторно запишите ключ через `set`.

---

## Когда использовать

- Коллекции с частыми императивными изменениями: кэш данных, индекс по ключу, хранилище выбранных элементов.
- Когда нужен **стабильный Map‑объект**, который компоненты могут напрямую мутировать, сохраняя простой API.
- Для UI‑сценариев, где удобен Map (быстрые вставки/удаления/поиск по ключу) и при этом требуется реактивность.

---

## Когда **не** использовать

- Если достаточно обычного состояния (`useState`/`useReducer`) с иммутабельными обновлениями.
- Когда требуется транзакционность/временные версии/история — предусмотрите слой поверх (история изменений), а не разгружайте это на карту.
- Если данные изменяются редко — простая структура (массив/объект) может быть понятнее.

---

## Частые ошибки

1. **Мутация по ссылке без `set`**
   - Изменение объекта из карты «на месте» не вызовет перерисовку. Создайте новый объект и вызовите `map.set(key, next)`.

2. **Переинициализация карты**
   - Не создавайте новый экземпляр вручную внутри рендера. Используйте возвращаемый из `useMap` объект — он стабилен.

3. **Неправильные зависимости эффектов**
   - Сама ссылка на карту стабильна; добавление её в массив зависимостей **не** приведёт к перезапуску эффекта при изменении содержимого. Для реакции на изменения читайте производные значения (например, `map.size`) и используйте их в зависимостях или обрабатывайте обновления в обработчиках событий.

---

## Типизация

**Экспортируемые типы**

- `ExtendedMap<KeyType, ValueType>`
   - Совместим с `Map`, но дополнительно предоставляет метод `replaceAll(entries)` для атомарной пересборки содержимого.
   - Мутации (`set`/`delete`/`clear`/`replaceAll`) инициируют перерисовку компонента.

---

## Смотрите также

- [useCollection](useCollection.md)
- [useSet](useSet.md)
