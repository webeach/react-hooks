# `useSessionStorage`

## Описание

`useSessionStorage` — хук, который привязывает состояние React к `sessionStorage` по заданному ключу.

- Инициализирует значение из хранилища (если там есть валидная строка), иначе — из `initialValue`.
- Возвращает кортеж `[value, setValue]`.
- `setValue` принимает как прямое значение, так и функциональный апдейтер `(prev) => next`.
- Поддерживает настраиваемые `serializer`/`deserializer`.
- Данные живут в рамках **текущей вкладки/окна** и очищаются при **закрытии сессии браузера** (в отличие от `localStorage`).

---

## Сигнатура

```ts
function useSessionStorage<ValueType = undefined>(
  key: string,
  initialValue?: undefined,
  options?: UseSessionStorageOptions<ValueType>,
): UseSessionStorageReturn<ValueType | undefined>;

function useSessionStorage<ValueType>(
  key: string,
  initialValue: ValueType | (() => ValueType),
  options?: UseSessionStorageOptions<ValueType>,
): UseSessionStorageReturn<ValueType>;
```

- **Параметры**
   - `key` — ключ в `sessionStorage`.
   - `initialValue?` — начальное значение или фабрика. Используется, если в хранилище нет валидной строки.
   - `options?` — настройки сериализации:
     - `serializer?: (key, value) => string` — преобразует значение в строку перед записью.
     - `deserializer?: (key, raw) => Value | undefined` — парсит строку из хранилища. Верните `undefined`, чтобы считать, что значения нет.

- **Возвращает**: `UseSessionStorageReturn<Value>` — кортеж `[value, setValue]`.

---

## Примеры

### 1) Параметр страницы на время сессии
```tsx
const [step, setStep] = useSessionStorage<number>('wizard:step', 1);

const next = () => setStep((prev) => (prev ?? 1) + 1);
```

### 2) Удаление значения (сброс ключа)
```tsx
const [draft, setDraft] = useSessionStorage<string | undefined>('form:draft');

// удалить сохранённое значение и установить state в undefined
setDraft(undefined);
```

### 3) Кастомные сериализаторы
```tsx
type Filter = { q: string; page: number };

const serializer = (_key: string, value: Filter) => JSON.stringify({ root: value });
const deserializer = (_key: string, rawValue: string): Filter | undefined => {
  const parsed = JSON.parse(rawValue);
  return parsed?.root;
};

const [filter, setFilter] = useSessionStorage<Filter>(
  'list:filter',
  { q: '', page: 1 },
  { serializer, deserializer },
);
```

---

## Поведение

1. **Инициализация**
   - При маунте читает строку `raw` из `sessionStorage[key]` и применяет `deserializer`.
   - Если `deserializer` вернул `undefined`, используется `initialValue`.

2. **Обновление**
   - `setValue(next)` записывает новую строку (через `serializer`) или удаляет ключ, если `next === undefined`.
   - Поддерживается функциональный апдейтер `(prev) => next`.

3. **Смена ключа**
   - При изменении `key` хук перечитывает значение для нового ключа, снова применяя `deserializer`.

4. **Область действия и срок жизни**
   - Значения из `sessionStorage` не разделяются между вкладками и очищаются при закрытии вкладки/окна или завершении сессии браузера.

---

## Когда использовать

- Пошаговые мастера, временные фильтры и состояние страниц в рамках одной вкладки.
- Черновики и ввод, который должен переживать перезагрузку, но **не** закрытие сессии.
- Эфемерные настройки интерфейса для текущего окна.

## Когда **не** использовать

- Нужна долговременная персистентность между сессиями — используйте `useLocalStorage`.
- Большие или сложные структуры — рассмотрите `IndexedDB`.
- Конфиденциальные данные без шифрования.

---

## Частые ошибки

1. **Ожидание разделения между вкладками**
   - `sessionStorage` изолирован по вкладкам; не синхронизируется автоматически.

2. **Ожидание возврата `initialValue` после `setValue(undefined)`**
   - В текущем маунте `value` станет `undefined`. `initialValue` применяется только при следующем маунте (если ключ отсутствует в хранилище).

3. **Несогласованный формат сериализации**
   - При изменении `serializer`/`deserializer` старые значения могут не распарситься; планируйте миграции.

---

## Типизация

**Экспортируемые типы**

- `UseSessionStorageReturn<Value>` — `[value: Value, setValue: (action) => void]`.
- `UseSessionStorageOptions<Value>` — опции `serializer`/`deserializer`.
- `UseSessionStorageSetAction<Value>` — `Value | ((prev: Value) => Value)`.

---

## Смотрите также

- [useLocalstorageStorage](useLocalstorageStorage.md)
