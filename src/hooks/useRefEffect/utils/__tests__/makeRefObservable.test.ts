import { MutableRefObject } from 'react';

import { makeRefObservable } from '../makeRefObservable';

const createRef = <T>(value: T): MutableRefObject<T> => ({
  current: value,
});

describe('makeRefObservable util', () => {
  it('notifies subscribers when ref.current is set to a new value', () => {
    const ref = createRef<HTMLDivElement | null>(null);
    const subscribers = makeRefObservable(ref);

    const handleSubscribe = vi.fn();
    subscribers.add(handleSubscribe);

    const div = document.createElement('div');
    ref.current = div;

    expect(handleSubscribe).toHaveBeenCalledTimes(1);
    expect(handleSubscribe).toHaveBeenCalledWith(div);
  });

  it('does not notify subscribers if ref.current is set to the same value', () => {
    const div = document.createElement('div');
    const ref = createRef(div);
    const subscribers = makeRefObservable(ref);

    const handleSubscribe = vi.fn();
    subscribers.add(handleSubscribe);

    ref.current = div;

    expect(handleSubscribe).not.toHaveBeenCalled();
  });

  it('avoids infinite loops if subscriber sets ref.current internally', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    const ref = createRef<HTMLDivElement | null>(null);
    const subscribers = makeRefObservable(ref);

    const handleSubscribe = vi.fn((value) => {
      if (value === div2) return;
      ref.current = div2; // reentrant write
    });

    subscribers.add(handleSubscribe);

    ref.current = div1;
    expect(handleSubscribe).toHaveBeenCalledTimes(1);

    ref.current = div2;
    expect(handleSubscribe).toHaveBeenCalledTimes(2);
  });

  it('returns the same subscriber set if already observable', () => {
    const ref = createRef(null);
    const s1 = makeRefObservable(ref);
    const s2 = makeRefObservable(ref);

    expect(s1).toBe(s2);
  });

  it('removes subscriber and stops notifying it', () => {
    const ref = createRef<HTMLDivElement | null>(null);
    const subscribers = makeRefObservable(ref);

    const handleSubscribe = vi.fn();
    subscribers.add(handleSubscribe);
    subscribers.delete(handleSubscribe);

    ref.current = document.createElement('div');
    expect(handleSubscribe).not.toHaveBeenCalled();
  });
});
