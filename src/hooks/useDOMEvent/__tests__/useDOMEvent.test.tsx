import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RefObject, useRef, useState } from 'react';

import {
  UseDOMEventHandler,
  UseDOMEventMap,
  UseDOMEventOptions,
  UseDOMEventType,
} from '../types';
import { useDOMEvent } from '../useDOMEvent';

function ComponentWithParams(props: {
  onClick: (event: MouseEvent) => void;
  options?: UseDOMEventOptions;
}) {
  const { onClick, options } = props;

  const ref = useRef<HTMLDivElement>(null);

  useDOMEvent(ref, 'click', onClick, options);

  return (
    <div ref={ref} tabIndex={0}>
      Box
    </div>
  );
}

function ComponentWithMap(props: { events: UseDOMEventMap }) {
  const { events } = props;

  const ref = useRef<HTMLDivElement>(null);

  useDOMEvent(ref, events);

  return (
    <div ref={ref} tabIndex={0}>
      Box
    </div>
  );
}

describe('useDOMEvent hook', () => {
  it('calls handler on single event (params)', async () => {
    const handler = vi.fn();

    render(<ComponentWithParams onClick={handler} />);

    await userEvent.click(screen.getByText('Box'));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls handler once with options.once', async () => {
    const handler = vi.fn();

    render(<ComponentWithParams onClick={handler} options={{ once: true }} />);

    const box = screen.getByText('Box');

    await userEvent.click(box);
    await userEvent.click(box);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('supports passive: true option', async () => {
    const handler = vi.fn();

    render(
      <ComponentWithParams onClick={handler} options={{ passive: true }} />,
    );

    await userEvent.click(screen.getByText('Box'));

    expect(handler).toHaveBeenCalled();
  });

  it('handles multiple events from map', async () => {
    const click = vi.fn();
    const focus = vi.fn();

    render(<ComponentWithMap events={{ click, focus }} />);

    const box = screen.getByText('Box');

    await userEvent.click(box);
    await userEvent.tab();

    expect(click).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  });

  it('supports map entry with handler and options', async () => {
    const handler = vi.fn();

    render(<ComponentWithMap events={{ click: [handler, { once: true }] }} />);

    const box = screen.getByText('Box');

    await userEvent.click(box);
    await userEvent.click(box);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('returns ref if none is provided (params)', () => {
    let capturedRef!: RefObject<Element | null>;

    function Test() {
      const [ref] = useDOMEvent('click', vi.fn());
      capturedRef = ref;
      return <div ref={ref as RefObject<HTMLDivElement>}>Box</div>;
    }

    render(<Test />);

    expect(capturedRef.current).toBeInstanceOf(HTMLElement);
  });

  it('returns ref if none is provided (map)', () => {
    let capturedRef!: RefObject<Element | null>;

    function Test() {
      const [ref] = useDOMEvent({ click: vi.fn() });
      capturedRef = ref;
      return <div ref={ref as RefObject<HTMLDivElement>}>Box</div>;
    }

    render(<Test />);

    expect(capturedRef.current).toBeInstanceOf(HTMLElement);
  });

  it('does not call handler after unmount', async () => {
    const handler = vi.fn();

    const { unmount } = render(<ComponentWithParams onClick={handler} />);

    const box = screen.getByText('Box');

    unmount();

    await userEvent.click(box);

    expect(handler).not.toHaveBeenCalled();
  });

  it('uses updated handler via liveRef', async () => {
    const first = vi.fn();
    const second = vi.fn();

    function Wrapper() {
      const [handler, setHandler] = useState(() => first);
      return (
        <>
          <button onClick={() => setHandler(() => second)}>Switch</button>
          <ComponentWithParams onClick={handler} />
        </>
      );
    }

    render(<Wrapper />);

    const box = screen.getByText('Box');
    const button = screen.getByText('Switch');

    await userEvent.click(box);
    await userEvent.click(button);
    await userEvent.click(box);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('calls correct event object type (KeyboardEvent)', async () => {
    const handler = vi.fn((event: KeyboardEvent) => {
      expect(event.key).toBeDefined();
    });

    function Test() {
      const [ref] = useDOMEvent('keydown', handler);
      return <input ref={ref as RefObject<HTMLInputElement>} />;
    }

    render(<Test />);

    await userEvent.type(screen.getByRole('textbox'), 'A');

    expect(handler).toHaveBeenCalled();
  });

  it('calls map event with options tuple', async () => {
    const handler = vi.fn();

    render(<ComponentWithMap events={{ click: [handler, { once: true }] }} />);

    const box = screen.getByText('Box');

    await userEvent.click(box);
    await userEvent.click(box);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles focus and blur events correctly', async () => {
    const focus = vi.fn();
    const blur = vi.fn();

    render(<ComponentWithMap events={{ focus, blur }} />);

    await userEvent.tab();
    await userEvent.tab();

    expect(focus).toHaveBeenCalled();
    expect(blur).toHaveBeenCalled();
  });

  it('rebinds listeners if event type changes', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    function Test({
      type,
      handler,
    }: {
      type: UseDOMEventType;
      handler: UseDOMEventHandler;
    }) {
      const ref = useRef<HTMLDivElement>(null);
      useDOMEvent(ref, type, handler);
      return <div ref={ref}>Box</div>;
    }

    const { rerender } = render(<Test type="click" handler={handler1} />);

    const box = screen.getByText('Box');

    await userEvent.click(box);

    rerender(<Test type="mousedown" handler={handler2} />);

    await userEvent.click(box);

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('does not rebind if map structure is the same', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    function Wrapper({ handler }: { handler: UseDOMEventHandler }) {
      const ref = useRef<HTMLDivElement>(null);
      useDOMEvent(ref, { click: handler });
      return <div ref={ref}>Box</div>;
    }

    const { rerender } = render(<Wrapper handler={handler1} />);

    await userEvent.click(screen.getByText('Box'));

    rerender(<Wrapper handler={handler2} />);

    await userEvent.click(screen.getByText('Box'));

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
