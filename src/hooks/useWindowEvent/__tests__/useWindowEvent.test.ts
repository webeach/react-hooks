import { renderHook } from '@testing-library/react';

import { UseWindowEventHandler } from '../types';
import { useWindowEvent } from '../useWindowEvent';

describe('useWindowEvent hook', () => {
  it('attaches and detaches window event handler (params)', () => {
    const handler = vi.fn();
    renderHook(() => useWindowEvent('resize', handler));
    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('attaches event with once option', () => {
    const handler = vi.fn();
    renderHook(() => useWindowEvent('scroll', handler, { once: true }));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('attaches multiple events from map', () => {
    const resize = vi.fn();
    const scroll = vi.fn();
    renderHook(() => useWindowEvent({ resize, scroll }));
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
    expect(resize).toHaveBeenCalled();
    expect(scroll).toHaveBeenCalled();
  });

  it('updates handler on re-render', () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ handler }) => {
        useWindowEvent('resize', handler);
      },
      { initialProps: { handler: first } },
    );

    window.dispatchEvent(new Event('resize'));
    expect(first).toHaveBeenCalledTimes(1);

    rerender({ handler: second });
    window.dispatchEvent(new Event('resize'));
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('removes event listeners on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useWindowEvent('scroll', handler));
    unmount();
    window.dispatchEvent(new Event('scroll'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls handler with correct event type', () => {
    const handler = vi.fn((e: KeyboardEvent) => {
      expect(e.key).toBeDefined();
    });
    renderHook(() => useWindowEvent('keydown', handler));
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    window.dispatchEvent(event);
    expect(handler).toHaveBeenCalled();
  });

  it('supports map with [handler, options] entries', () => {
    const handler = vi.fn();
    renderHook(() => useWindowEvent({ resize: [handler, { once: true }] }));
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not rebind if structure is same but handler changes (map)', () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ handler }) => {
        useWindowEvent({ resize: handler });
      },
      { initialProps: { handler: first } },
    );

    window.dispatchEvent(new Event('resize'));
    rerender({ handler: second });
    window.dispatchEvent(new Event('resize'));

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('rebinds if keys change in map', () => {
    const resize = vi.fn();
    const scroll = vi.fn();

    const { rerender } = renderHook<
      void,
      {
        events: {
          resize?: UseWindowEventHandler;
          scroll?: UseWindowEventHandler;
        };
      }
    >(
      ({ events }) => {
        useWindowEvent(events);
      },
      { initialProps: { events: { resize } } },
    );

    window.dispatchEvent(new Event('resize'));
    rerender({ events: { scroll } });
    window.dispatchEvent(new Event('scroll'));

    expect(resize).toHaveBeenCalledTimes(1);
    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it('supports complex event sets with options on each', () => {
    const resize = vi.fn();
    const scroll = vi.fn();

    renderHook(() =>
      useWindowEvent({
        resize: [resize, { passive: true }],
        scroll: [scroll, { once: true }],
      }),
    );

    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    expect(resize).toHaveBeenCalledTimes(1);
    expect(scroll).toHaveBeenCalledTimes(1);
  });
});
