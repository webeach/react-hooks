import { ExtendedMap } from '../ExtendedMap';

describe('ExtendedMap class', () => {
  it('calls onUpdate after set', () => {
    const map = new ExtendedMap();
    const onUpdate = vi.fn();
    map.onUpdate = onUpdate;

    map.set('foo', 1);

    expect(map.get('foo')).toBe(1);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('calls onUpdate after delete', () => {
    const map = new ExtendedMap([['foo', 1]]);
    const onUpdate = vi.fn();
    map.onUpdate = onUpdate;

    map.delete('foo');

    expect(map.has('foo')).toBe(false);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not call onUpdate if delete fails', () => {
    const map = new ExtendedMap();
    const onUpdate = vi.fn();
    map.onUpdate = onUpdate;

    const result = map.delete('foo');

    expect(result).toBe(false);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('calls onUpdate after clear', () => {
    const map = new ExtendedMap([['foo', 1]]);
    const onUpdate = vi.fn();
    map.onUpdate = onUpdate;

    map.clear();

    expect(map.size).toBe(0);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not call onUpdate if map is already empty', () => {
    const map = new ExtendedMap();
    const onUpdate = vi.fn();
    map.onUpdate = onUpdate;

    map.clear();

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('calls onUpdate after replaceAll', () => {
    const map = new ExtendedMap();
    const onUpdate = vi.fn();
    map.onUpdate = onUpdate;

    map.replaceAll([
      ['a', 1],
      ['b', 2],
    ]);

    expect(map.size).toBe(2);
    expect(map.get('a')).toBe(1);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not call onUpdate if replaceAll gets empty array and map is empty', () => {
    const map = new ExtendedMap();
    const onUpdate = vi.fn();
    map.onUpdate = onUpdate;

    map.replaceAll([]);

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('can override existing value', () => {
    const map = new ExtendedMap([['x', 1]]);
    map.set('x', 42);

    expect(map.get('x')).toBe(42);
  });

  it("get returns undefined if key doesn't exist", () => {
    const map = new ExtendedMap();

    expect(map.get('not-found')).toBeUndefined();
  });

  it('has returns true for existing key', () => {
    const map = new ExtendedMap([['k', 123]]);

    expect(map.has('k')).toBe(true);
  });

  it('has returns false for missing key', () => {
    const map = new ExtendedMap();

    expect(map.has('x')).toBe(false);
  });

  it('delete returns true when key is removed', () => {
    const map = new ExtendedMap([['k', 123]]);

    expect(map.delete('k')).toBe(true);
  });

  it('replaceAll overwrites all existing data', () => {
    const map = new ExtendedMap([['old', 0]]);
    map.replaceAll([['new', 1]]);

    expect(map.size).toBe(1);
    expect(map.has('old')).toBe(false);
    expect(map.has('new')).toBe(true);
  });

  it('onUpdate can be reassigned', () => {
    const map = new ExtendedMap();
    const first = vi.fn();
    const second = vi.fn();

    map.onUpdate = first;
    map.set('a', 1);
    map.onUpdate = second;
    map.set('b', 2);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('works with complex key types', () => {
    const key = { a: 1 };
    const map = new ExtendedMap();
    map.set(key, 'value');

    expect(map.get(key)).toBe('value');
  });
});
