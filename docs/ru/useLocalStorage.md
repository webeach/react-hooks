# `useLocalStorage`

## Описание

`useLocalStorage` — хук, который привязывает состояние React к `localStorage` по заданному ключу.

- Инициализирует значение из хранилища (если там есть валидная строка), иначе — из `initialValue`.
- Возвращает кортеж `[value, setValue]`.
- `setValue` принимает как прямое значение, так и функциональный апдейтер `(prev) => next`.
- Поддерживает настраиваемые `serializer`/`deserializer`, а также синхронизацию между вкладками через `watch`.

---

## Сигнатура

```ts
function useLocalStorage<ValueType = undefined>(
  key: string,
  initialValue?: undefined,
  options?: UseLocalStorageOptions<ValueType>,
): UseLocalStorageReturn<ValueType | undefined>;

function useLocalStorage<ValueType>(
  key: string,
  initialValue: ValueType | (() => ValueType),
  options?: UseLocalStorageOptions<ValueType>,
): UseLocalStorageReturn<ValueType>;
```

- **Параметры**
   - `key` — ключ в `localStorage`.
   - `initialValue?` — начальное значение или фабрика. Используется, если в хранилище нет валидной строки.
   - `options?` — настройки сериализации и поведения:
      - `serializer?: (key, value) => string` — преобразует значение в строку перед записью.
      - `deserializer?: (key, raw) => Value | undefined` — парсит строку из хранилища. Верните `undefined`, чтобы считать, что значения нет.
      - `watch?: boolean` — обновлять ли состояние при изменении этого ключа в других вкладках.

- **Возвращает**: `UseLocalStorageReturn<Value>` — кортеж `[value, setValue]`.

---

## Примеры

### 1) Простейшее сохранение предпочтения
```tsx
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(
  'ui:theme',
  'light',
);

// позже, при переключении
setTheme('dark');
```

### 2) Счётчик с функциональным апдейтером
```tsx
const [count, setCount] = useLocalStorage<number>('app:count', 0);

const inc = () => setCount((prev) => (prev ?? 0) + 1);
const reset = () => setCount(0);
```

### 3) Удаление значения (сброс ключа)
```tsx
const [token, setToken] = useLocalStorage<string | undefined>('auth:token');

// удалить сохранённое значение и установить state в undefined
setToken(undefined);
```

### 4) Кастомные сериализаторы
```tsx
type Profile = { id: number; name: string };

const serializer = (_key: string, value: Profile) => JSON.stringify({ root: value });
const deserializer = (_key: string, rawValue: string): Profile | undefined => {
  const parsed = JSON.parse(rawValue);
  return parsed?.root;
};

const [profile, setProfile] = useLocalStorage<Profile>(
  'user:profile',
  { id: 1, name: 'Ada' },
  { serializer, deserializer },
);
```

### 5) Синхронизация между вкладками
```tsx
const [filter, setFilter] = useLocalStorage<string>('list:filter', '', {
  watch: true,
});
```

---

## Поведение

1. **Инициализация**
   - При маунте читает строку `raw` из `localStorage[key]` и применяет `deserializer`.
   - Если `deserializer` вернул `undefined`, используется `initialValue`.

2. **Обновление**
   - `setValue(next)` записывает новую строку (через `serializer`) или удаляет ключ, если `next === undefined`.
   - Функциональный апдейтер получает текущее значение `prev` и должен вернуть следующее.

3. **Смена ключа**
   - При изменении `key` хук перечитывает значение для нового ключа, снова применяя `deserializer`.

4. **Синхронизация между вкладками** (если `watch: true`)
   - Обновляет state по событию `storage` при совпадении `key` и `storageArea`.

---

## Когда использовать

- Пользовательские настройки (тема, язык, фильтры, раскладки).
- Короткие кэши и флаги (последний открытый таб, «видел ли пользователь баннер»).
- Сохранение форм и черновиков между перезагрузками.

## Когда **не** использовать

- Большие объёмы или сложные структуры (лучше `IndexedDB`).
- Конфиденциальные данные без шифрования.
- Состояния, которые не нужно переживать перезагрузку.

---

## Частые ошибки

1. **Непоследовательный формат хранения**
   - При изменении логики сериализации/десериализации старые значения могут не распарситься — планируйте миграции.

2. **Ожидание возврата `initialValue` после `setValue(undefined)`**
   - В текущем маунте `value` станет `undefined`. `initialValue` применяется только при первом маунте.

3. **Забытый `watch` для общего ключа**
   - Если ключ редактируется из другой вкладки, включайте `watch: true`, чтобы получать обновления автоматически.

---

## Типизация

**Экспортируемым типы**

- `UseLocalStorageReturn<Value>` — `[value: Value, setValue: (action) => void]`.
- `UseLocalStorageOptions<Value>` — опции `serializer`/`deserializer` и `watch`.
- `UseLocalStorageSetAction<Value>` — `Value | ((prev: Value) => Value)`.

---

## Смотрите также

- [useSessionStorage](useSessionStorage.md)
