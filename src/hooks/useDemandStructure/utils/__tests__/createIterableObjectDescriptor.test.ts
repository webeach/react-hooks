import { MutableRefObject } from 'react';

import { createIterableObjectDescriptor } from '../createIterableObjectDescriptor';

describe('createIterableObjectDescriptor util', () => {
  const createRef = <T extends object>(value: T): MutableRefObject<T> => ({
    current: value,
  });

  const createUsageRef = () => ({
    current: {} as Record<string | number, boolean>,
  });

  it('creates descriptor with lazy getters for array items', () => {
    const accessors = [vi.fn(() => 'a'), vi.fn(() => 'b')];
    const usageRef = createUsageRef();
    const descriptor = createIterableObjectDescriptor(
      createRef(accessors),
      usageRef,
    );
    const result = Object.defineProperties({}, descriptor) as string[];

    expect(result[0]).toBe('a');
    expect(result[1]).toBe('b');
    expect(accessors[0]).toHaveBeenCalledTimes(1);
    expect(accessors[1]).toHaveBeenCalledTimes(1);
    expect(usageRef.current[0]).toBe(true);
    expect(usageRef.current[1]).toBe(true);
  });

  it('does not pre-evaluate items', () => {
    const spy = vi.fn(() => 'lazy');
    const usageRef = createUsageRef();
    const descriptor = createIterableObjectDescriptor(
      createRef([spy]),
      usageRef,
    );
    Object.defineProperties({}, descriptor);
    expect(spy).not.toHaveBeenCalled();
    expect(usageRef.current[0]).toBeUndefined();
  });

  it('returns correct length property', () => {
    const usageRef = createUsageRef();
    const descriptor = createIterableObjectDescriptor(
      createRef([() => 1, () => 2]),
      usageRef,
    );
    const result = Object.defineProperties({}, descriptor) as number[];
    expect(result.length).toBe(2);
  });

  it('supports array destructuring correctly', () => {
    const accessors = [vi.fn(() => 'first'), vi.fn(() => 'second')];
    const usageRef = createUsageRef();
    const descriptor = createIterableObjectDescriptor(
      createRef(accessors),
      usageRef,
    );
    const result = Object.defineProperties({}, descriptor) as [string, string];

    const [first, second] = result;

    expect(first).toBe('first');
    expect(second).toBe('second');
    expect(accessors[0]).toHaveBeenCalledTimes(1);
    expect(accessors[1]).toHaveBeenCalledTimes(1);
  });

  it('supports iteration with Symbol.iterator', () => {
    const usageRef = createUsageRef();
    const descriptor = createIterableObjectDescriptor(
      createRef([() => 1, () => 2, () => 3]),
      usageRef,
    );
    const result = Object.defineProperties({}, descriptor) as number[];
    expect([...result]).toEqual([1, 2, 3]);
  });

  it('supports alias access for aliased accessors', () => {
    const usageRef = createUsageRef();
    const descriptor = createIterableObjectDescriptor(
      createRef([
        { alias: 'foo', accessor: () => 42 },
        { alias: 'bar', accessor: () => 'hello' },
      ]),
      usageRef,
    );
    const result = Object.defineProperties({}, descriptor) as any;

    expect(result[0]).toBe(42);
    expect(result[1]).toBe('hello');
    expect(result.foo).toBe(42);
    expect(result.bar).toBe('hello');
    expect(usageRef.current[0]).toBe(true);
    expect(usageRef.current[1]).toBe(true);
    expect(usageRef.current.foo).toBe(true);
    expect(usageRef.current.bar).toBe(true);
  });

  it('uses same getter for index and alias', () => {
    const fn = vi.fn(() => 'shared');
    const usageRef = createUsageRef();
    const descriptor = createIterableObjectDescriptor(
      createRef([{ alias: 'sharedKey', accessor: fn }]),
      usageRef,
    );
    const result = Object.defineProperties({}, descriptor) as any;

    expect(result[0]).toBe('shared');
    expect(result.sharedKey).toBe('shared');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('alias does not overwrite index', () => {
    const usageRef = createUsageRef();
    const descriptor = createIterableObjectDescriptor(
      createRef([
        { alias: 'alpha', accessor: () => 'A' },
        { alias: 'beta', accessor: () => 'B' },
      ]),
      usageRef,
    );
    const result = Object.defineProperties({}, descriptor) as any;

    expect(result[0]).toBe('A');
    expect(result[1]).toBe('B');
    expect(result.alpha).toBe('A');
    expect(result.beta).toBe('B');
  });

  it('supports numeric aliases', () => {
    const usageRef = createUsageRef();
    const descriptor = createIterableObjectDescriptor(
      createRef([{ alias: 100, accessor: () => 'century' }]),
      usageRef,
    );
    const result = Object.defineProperties({}, descriptor) as any;

    expect(result[0]).toBe('century');
    expect(result[100]).toBe('century');
    expect(usageRef.current[0]).toBe(true);
    expect(usageRef.current[100]).toBe(true);
  });
});
