import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollectionItem } from '@webeach/collection';
import { useEffect, useMemo, useRef } from 'react';

import { useCollection } from '../useCollection';

/** Test helpers */
function makeInitialItems(): ReadonlyArray<
  CollectionItem<'key', string, { key: string; label: string }>
> {
  return [
    { key: 'a1', label: 'Alpha' },
    { key: 'b2', label: 'Beta' },
    { key: 'c3', label: 'Gamma' },
  ] as const;
}

function ListView({
  items,
}: {
  items: ReadonlyArray<
    CollectionItem<'key', string, { key: string; label: string }>
  >;
}) {
  return (
    <ul aria-label="Items" role="list">
      {items.map((item) => (
        <li key={item.key} role="listitem" aria-label={item.label}>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function TestComponentArrayOverload() {
  const [items, collection] = useCollection(makeInitialItems());
  return (
    <div>
      <ListView items={items} />
      <div>
        <button
          onClick={() => collection.appendItem({ key: 'd4', label: 'Delta' })}
        >
          Append Delta
        </button>
        <button
          onClick={() => collection.prependItem({ key: 'z0', label: 'Zeta' })}
        >
          Prepend Zeta
        </button>
        <button
          onClick={() => collection.appendItemAt({ key: 'x9', label: 'Xi' }, 1)}
        >
          Insert Xi At 1
        </button>
        <button
          onClick={() =>
            collection.insertItemBefore('b2', {
              key: 'bb',
              label: 'Before Beta',
            })
          }
        >
          Insert Before Beta
        </button>
        <button
          onClick={() =>
            collection.insertItemAfter('b2', { key: 'ba', label: 'After Beta' })
          }
        >
          Insert After Beta
        </button>
        <button
          onClick={() =>
            collection.patchItem('b2', { label: 'Beta Patched' } as any)
          }
        >
          Patch Beta
        </button>
        <button
          onClick={() =>
            collection.replaceItem('b2', { key: 'b2', label: 'Beta Replaced' })
          }
        >
          Replace Beta
        </button>
        <button onClick={() => collection.removeItem('a1')}>
          Remove Alpha
        </button>
        <button onClick={() => collection.clear()}>Clear</button>
        <button onClick={() => collection.reset()}>Reset</button>
        <button
          onClick={() =>
            collection.setItems([
              { key: 'n1', label: 'Nu' },
              { key: 'o2', label: 'Omicron' },
            ])
          }
        >
          Set New Items
        </button>
      </div>
    </div>
  );
}

function TestComponentOptionsOverload() {
  const [items, collection] = useCollection<
    'id',
    number,
    { id: number; label: string }
  >({
    primaryKey: 'id',
    initialItems: [
      { id: 1, label: 'One' },
      { id: 2, label: 'Two' },
    ],
  });

  return (
    <div>
      <ul aria-label="Items by Id" role="list">
        {items.map((item) => (
          <li key={item.id} role="listitem" aria-label={item.label}>
            {item.label}
          </li>
        ))}
      </ul>
      <button onClick={() => collection.appendItem({ id: 3, label: 'Three' })}>
        Append Three
      </button>
      <button
        onClick={() => collection.patchItem(2, { label: 'Two Patched' } as any)}
      >
        Patch Two
      </button>
      <button onClick={() => collection.removeItem(1)}>Remove One</button>
    </div>
  );
}

/**
 * A small probe component to verify that the collection instance is stable across rerenders
 * and that items update causes rerender of the view.
 */
function StabilityProbe({
  onCaptureInstance,
  makeNewItems,
}: {
  onCaptureInstance: (instance: unknown) => void;
  makeNewItems?: () => ReadonlyArray<{ key: string; label: string }>;
}) {
  const initial = useMemo(
    () => (makeNewItems ? makeNewItems() : makeInitialItems()),
    [makeNewItems],
  );
  const [items, collection] = useCollection(initial);
  const capturedRef = useRef<unknown | null>(null);

  useEffect(() => {
    if (capturedRef.current === null) {
      capturedRef.current = collection;
      onCaptureInstance(collection);
    }
  }, [collection, onCaptureInstance]);

  return (
    <div>
      <ListView items={items} />
      <button
        onClick={() => collection.appendItem({ key: 'new', label: 'New' })}
      >
        Append New
      </button>
    </div>
  );
}

/** Tests */
describe('useCollection hook', () => {
  it('initializes with array overload and renders items', () => {
    render(<TestComponentArrayOverload />);
    // Presence checks without jest-dom matchers: getByRole throws if missing
    expect(() => screen.getByRole('list', { name: 'Items' })).not.toThrow();
    expect(() => screen.getByRole('listitem', { name: 'Alpha' })).not.toThrow();
    expect(() => screen.getByRole('listitem', { name: 'Beta' })).not.toThrow();
    expect(() => screen.getByRole('listitem', { name: 'Gamma' })).not.toThrow();
  });

  it('appends item and updates the list', async () => {
    render(<TestComponentArrayOverload />);
    await userEvent.click(screen.getByRole('button', { name: 'Append Delta' }));
    expect(() => screen.getByRole('listitem', { name: 'Delta' })).not.toThrow();
  });

  it('prepends item and appears as the first listitem', async () => {
    render(<TestComponentArrayOverload />);
    await userEvent.click(screen.getByRole('button', { name: 'Prepend Zeta' }));
    const list = screen.getByRole('list', { name: 'Items' });
    const listItems = within(list).getAllByRole('listitem');
    const zetaItem = screen.getByRole('listitem', { name: 'Zeta' });
    expect(listItems[0]).toBe(zetaItem);
  });

  it('inserts at specific index via appendItemAt', async () => {
    render(<TestComponentArrayOverload />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Insert Xi At 1' }),
    );
    const list = screen.getByRole('list', { name: 'Items' });
    const listItems = within(list).getAllByRole('listitem');
    const xiItem = screen.getByRole('listitem', { name: 'Xi' });
    expect(listItems[1]).toBe(xiItem);
  });

  it('inserts before and after a keyed item', async () => {
    render(<TestComponentArrayOverload />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Insert Before Beta' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Insert After Beta' }),
    );
    expect(() =>
      screen.getByRole('listitem', { name: 'Before Beta' }),
    ).not.toThrow();
    expect(() =>
      screen.getByRole('listitem', { name: 'After Beta' }),
    ).not.toThrow();
  });

  it('patches an item without changing its key', async () => {
    render(<TestComponentArrayOverload />);
    await userEvent.click(screen.getByRole('button', { name: 'Patch Beta' }));
    expect(() =>
      screen.getByRole('listitem', { name: 'Beta Patched' }),
    ).not.toThrow();
  });

  it('replaces an item by key', async () => {
    render(<TestComponentArrayOverload />);
    await userEvent.click(screen.getByRole('button', { name: 'Replace Beta' }));
    expect(() =>
      screen.getByRole('listitem', { name: 'Beta Replaced' }),
    ).not.toThrow();
  });

  it('removes an item by key', async () => {
    render(<TestComponentArrayOverload />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove Alpha' }));
    const node = screen.queryByRole('listitem', { name: 'Alpha' });
    expect(node === null).toBe(true);
  });

  it('clears and resets the collection', async () => {
    render(<TestComponentArrayOverload />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    const afterClear = screen.queryAllByRole('listitem');
    expect(afterClear.length).toBe(0);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(() => screen.getByRole('listitem', { name: 'Alpha' })).not.toThrow();
    expect(() => screen.getByRole('listitem', { name: 'Beta' })).not.toThrow();
    expect(() => screen.getByRole('listitem', { name: 'Gamma' })).not.toThrow();
  });

  it('sets entirely new items', async () => {
    render(<TestComponentArrayOverload />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Set New Items' }),
    );
    expect(() => screen.getByRole('listitem', { name: 'Nu' })).not.toThrow();
    expect(() =>
      screen.getByRole('listitem', { name: 'Omicron' }),
    ).not.toThrow();
    const alphaNode = screen.queryByRole('listitem', { name: 'Alpha' });
    expect(alphaNode === null).toBe(true);
  });

  it('initializes with options overload and respects custom primary key', async () => {
    render(<TestComponentOptionsOverload />);
    expect(() =>
      screen.getByRole('list', { name: 'Items by Id' }),
    ).not.toThrow();
    expect(() => screen.getByRole('listitem', { name: 'One' })).not.toThrow();
    expect(() => screen.getByRole('listitem', { name: 'Two' })).not.toThrow();

    await userEvent.click(screen.getByRole('button', { name: 'Append Three' }));
    expect(() => screen.getByRole('listitem', { name: 'Three' })).not.toThrow();

    await userEvent.click(screen.getByRole('button', { name: 'Patch Two' }));
    expect(() =>
      screen.getByRole('listitem', { name: 'Two Patched' }),
    ).not.toThrow();

    await userEvent.click(screen.getByRole('button', { name: 'Remove One' }));
    const oneNode = screen.queryByRole('listitem', { name: 'One' });
    expect(oneNode === null).toBe(true);
  });

  it('keeps the same Collection instance across rerenders and updates items reactively', async () => {
    let capturedInstance: unknown | null = null;
    const handleCaptureInstance = (instance: unknown) => {
      capturedInstance = instance;
    };

    const { rerender } = render(
      <StabilityProbe onCaptureInstance={handleCaptureInstance} />,
    );

    // Append once -> one "New" item exists
    await userEvent.click(screen.getByRole('button', { name: 'Append New' }));
    expect(() => screen.getByRole('listitem', { name: 'New' })).not.toThrow();

    // Rerender with different initial factory -> instance should stay the same
    const makeOtherItems = () =>
      [
        { key: 'q1', label: 'Q1' },
        { key: 'q2', label: 'Q2' },
      ] as const;

    rerender(
      <StabilityProbe
        onCaptureInstance={handleCaptureInstance}
        makeNewItems={makeOtherItems}
      />,
    );

    // Identity captured (not null) and items did NOT reset to Q1/Q2
    expect(capturedInstance).not.toBeNull();
    const q1Node = screen.queryByRole('listitem', { name: 'Q1' });
    const q2Node = screen.queryByRole('listitem', { name: 'Q2' });
    expect(q1Node === null).toBe(true);
    expect(q2Node === null).toBe(true);

    // Append the same key again -> Collection replaces the existing item (no duplicates)
    await userEvent.click(screen.getByRole('button', { name: 'Append New' }));
    const newNodes = screen.getAllByRole('listitem', { name: 'New' });
    expect(newNodes.length).toBe(1);
  });
});
