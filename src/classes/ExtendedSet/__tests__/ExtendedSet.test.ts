import { ExtendedSet } from '../ExtendedSet';

describe('ExtendedSet class', () => {
  it('calls onUpdate after add', () => {
    const set = new ExtendedSet();
    const onUpdate = vi.fn();
    set.onUpdate = onUpdate;

    set.add('foo');

    expect(set.has('foo')).toBe(true);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('calls onUpdate after delete', () => {
    const set = new ExtendedSet(['foo']);
    const onUpdate = vi.fn();
    set.onUpdate = onUpdate;

    set.delete('foo');

    expect(set.has('foo')).toBe(false);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not call onUpdate if delete fails', () => {
    const set = new ExtendedSet();
    const onUpdate = vi.fn();
    set.onUpdate = onUpdate;

    const result = set.delete('foo');

    expect(result).toBe(false);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('calls onUpdate after clear', () => {
    const set = new ExtendedSet(['foo']);
    const onUpdate = vi.fn();
    set.onUpdate = onUpdate;

    set.clear();

    expect(set.size).toBe(0);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not call onUpdate if set is already empty', () => {
    const set = new ExtendedSet();
    const onUpdate = vi.fn();
    set.onUpdate = onUpdate;

    set.clear();

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('calls onUpdate after replaceAll', () => {
    const set = new ExtendedSet();
    const onUpdate = vi.fn();
    set.onUpdate = onUpdate;

    set.replaceAll(['a', 'b']);

    expect(set.size).toBe(2);
    expect(set.has('a')).toBe(true);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not call onUpdate if replaceAll gets empty array and set is empty', () => {
    const set = new ExtendedSet();
    const onUpdate = vi.fn();
    set.onUpdate = onUpdate;

    set.replaceAll([]);

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('add does not duplicate existing values', () => {
    const set = new ExtendedSet(['x']);
    const onUpdate = vi.fn();
    set.onUpdate = onUpdate;

    set.add('x');

    expect(set.size).toBe(1);
    expect(onUpdate).toHaveBeenCalledTimes(1); // всё равно должен вызываться
  });

  it('has returns true for existing value', () => {
    const set = new ExtendedSet(['k']);

    expect(set.has('k')).toBe(true);
  });

  it('has returns false for missing value', () => {
    const set = new ExtendedSet();

    expect(set.has('x')).toBe(false);
  });

  it('delete returns true when value is removed', () => {
    const set = new ExtendedSet(['k']);

    expect(set.delete('k')).toBe(true);
  });

  it('replaceAll overwrites all existing data', () => {
    const set = new ExtendedSet(['old']);
    set.replaceAll(['new']);

    expect(set.size).toBe(1);
    expect(set.has('old')).toBe(false);
    expect(set.has('new')).toBe(true);
  });

  it('onUpdate can be reassigned', () => {
    const set = new ExtendedSet();
    const first = vi.fn();
    const second = vi.fn();

    set.onUpdate = first;
    set.add('a');
    set.onUpdate = second;
    set.add('b');

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('works with complex value types', () => {
    const obj = { a: 1 };
    const set = new ExtendedSet();
    set.add(obj);

    expect(set.has(obj)).toBe(true);
  });
});
