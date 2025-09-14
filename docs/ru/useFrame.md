# `useFrame`

## Описание

`useFrame` — хук, который вызывает ваш колбэк **на каждом кадре анимации** (`requestAnimationFrame`). Колбэк получает полезные тайминги:
- `frame` — номер кадра, начиная с `1`;
- `deltaTime` — миллисекунды с предыдущего кадра;
- `timeSinceStart` — миллисекунды с первого кадра.

Хук удобен для анимаций, синхронизации с частотой обновления экрана, измерений и постепенных вычислений.

---

## Сигнатура

```ts
function useFrame(callback: UseFrameCallback): void;
```

- **Параметры**
   - `callback` — функция, вызываемая на каждом `requestAnimationFrame` с объектом таймингов.

- **Возвращает**
   - `void` — побочных значений нет; хук лишь подписывает/отписывает кадры.

---

## Примеры

### 1) Логирование таймингов

```tsx
import { useFrame } from '@webeach/react-hooks/useFrame';

export function Logger() {
  useFrame(({ frame, deltaTime, timeSinceStart }) => {
    if (frame % 60 === 0) {
      console.log('frame', frame, 'Δ', deltaTime.toFixed(2), 'ms', 'total', timeSinceStart.toFixed(2), 'ms');
    }
  });
  return null;
}
```

### 2) Плавное перемещение (с использованием `deltaTime`)

```tsx
import { useRef } from 'react';
import { useFrame } from '@webeach/react-hooks/useFrame';

export function BoxMover() {
  const boxRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);

  useFrame(({ deltaTime }) => {
    xRef.current += 0.1 * deltaTime; // 0.1px на миллисекунду (≈6px/кадр при 60fps)
    if (boxRef.current) {
      boxRef.current.style.transform = `translateX(${xRef.current}px)`;
    }
  });

  return <div ref={boxRef} style={{ width: 40, height: 40, backgroundColor: 'green' }} />;
}
```

### 3) Пауза/возобновление анимации

```tsx
import { useState } from 'react';
import { useFrame, useToggle } from '@webeach/react-hooks/useFrame';

export function Clock() {
  const [paused, togglePaused] = useToggle(false);
  const [ms, setMs] = useState(0);

  useFrame(({ deltaTime }) => {
    if (paused) {
      return;
    }

    setMs((prevMs) => prevMs + deltaTime);
  });

  return (
    <div>
      <output>{ms.toFixed(0)} ms</output>
      <button onClick={() => togglePaused()}>{paused ? 'Resume' : 'Pause'}</button>
    </div>
  );
}
```

---

## Поведение

1. **Частота вызовов**
   - Колбэк вызывается один раз на кадр браузерной анимации; частота зависит от устройства и вкладки.

2. **Тайминги**
   - В `callback` приходят `frame`, `deltaTime` и `timeSinceStart` — можно строить кадрово‑независимые анимации.

3. **Актуальность логики**
   - Хук использует актуальную версию переданного `callback`; обновление пропсов/состояния в компоненте автоматически подхватывается без ручной переподписки.

4. **Очистка**
   - При размонтировании подписка снимается; следующий кадр отменяется корректно.

5. **Layout‑контекст**
   - Эффект синхронизируется с фазой layout; это удобно для измерений и подготовки перед пейнтом.

---

## Когда использовать

- Кадровые анимации и интерполяции (позиции, непрозрачности, счётчики).
- Плавные интеграции с Canvas/WebGL/SVG.
- Регулярные измерения/синхронизация состояния с реальным временем кадра.

---

## Когда **не** использовать

- Для редких/разовых действий — достаточно `setTimeout`/`useEffect`.
- Для тяжёлых вычислений на каждом кадре, которые могут блокировать UI — распределяйте работу, уменьшайте нагрузку или снижайте частоту.

---

## Частые ошибки

1. **Тяжёлая работа в кадре**
   - Длительный код внутри колбэка увеличит `deltaTime` и сделает анимацию «дёрганой». Выносите тяжёлые задачи, используйте батчинг/воркеры.

2. **Ожидание фиксированных 60fps**
   - Частота кадров не гарантирована; используйте `deltaTime` для кадрово‑независимых расчётов.

3. **Ссылочные мутации без рендера**
   - Если меняете DOM/рефы вручную, UI обновится; но если храните значения в обычных переменных, они не вызывают ререндер — используйте `useState`/`useRef` по задаче.

---

## Типизация

**Экспортируемые типы**

- `UseFrameCallback`
   - `(info: { frame: number; deltaTime: number; timeSinceStart: number }) => void` — функция, вызываемая на каждом кадре с таймингами.

---

## Смотрите также

- [useFrameExtended](useFrameExtended.md)
- [useLoop](useLoop.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
