import { MutableRefObject } from 'react';

import { createObjectDescriptor } from '../createObjectDescriptor';

describe('createObjectDescriptor util', () => {
  const createRef = <T extends object>(value: T): MutableRefObject<T> => ({
    current: value,
  });

  it('creates descriptors that lazily evaluate properties and track usage', () => {
    const accessors = {
      foo: vi.fn(() => 'foo-value'),
      bar: vi.fn(() => 'bar-value'),
    };
    const usingMap = { foo: false, bar: false };
    const descriptor = createObjectDescriptor(
      createRef(accessors),
      createRef(usingMap),
    );
    const result = Object.defineProperties({}, descriptor) as {
      foo: string;
      bar: string;
    };

    expect(result.foo).toBe('foo-value');
    expect(result.bar).toBe('bar-value');

    expect(accessors.foo).toHaveBeenCalledTimes(1);
    expect(accessors.bar).toHaveBeenCalledTimes(1);
    expect(usingMap.foo).toBe(true);
    expect(usingMap.bar).toBe(true);
  });

  it('does not call accessors until accessed', () => {
    const accessors = {
      lazy: vi.fn(() => 'lazy-value'),
    };
    const usingMap = { lazy: false };

    const descriptor = createObjectDescriptor(
      createRef(accessors),
      createRef(usingMap),
    );
    const result = Object.defineProperties({}, descriptor) as { lazy: string };

    expect(accessors.lazy).not.toHaveBeenCalled();
    expect(usingMap.lazy).toBe(false);

    expect(result.lazy).toBe('lazy-value');
    expect(accessors.lazy).toHaveBeenCalledTimes(1);
    expect(usingMap.lazy).toBe(true);
  });

  it('skips inherited properties in accessors object', () => {
    const proto = { inherited: () => 'nope' };
    const accessors = Object.create(proto);
    accessors.own = vi.fn(() => 'yep');
    const usingMap = { own: false };

    const descriptor = createObjectDescriptor(
      createRef(accessors),
      createRef(usingMap),
    );
    const result = Object.defineProperties({}, descriptor) as { own: string };

    expect(result).not.toHaveProperty('inherited');
    expect(result.own).toBe('yep');
    expect(usingMap.own).toBe(true);
  });

  it('supports object destructuring correctly', () => {
    const accessors = {
      alpha: vi.fn(() => 42),
      beta: vi.fn(() => 'hello'),
    };
    const usingMap = { alpha: false, beta: false };

    const descriptor = createObjectDescriptor(
      createRef(accessors),
      createRef(usingMap),
    );
    const result = Object.defineProperties({}, descriptor) as {
      alpha: number;
      beta: string;
    };

    const { alpha, beta } = result;

    expect(alpha).toBe(42);
    expect(beta).toBe('hello');
    expect(accessors.alpha).toHaveBeenCalledTimes(1);
    expect(accessors.beta).toHaveBeenCalledTimes(1);
    expect(usingMap.alpha).toBe(true);
    expect(usingMap.beta).toBe(true);
  });
});
