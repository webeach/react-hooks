import { useMemo } from 'react';

import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';

import { TitleHistoryItem } from './types';

const titleHistoryList: TitleHistoryItem[] = [];
const titleHistoryMap = new Map<number, TitleHistoryItem>();

let originTitle: string | undefined;
let globalTitleKey = 0;

/**
 * React hook that sets `document.title` while the component is mounted.
 *
 * Supports nested usage by preserving a title history stack and restoring the
 * previous title when the component is unmounted.
 *
 * @param {string} title - The title to set for the current page/component context.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/usePageTitle.md
 */
export function usePageTitle(title: string) {
  // Allocate a unique key for this hook instance, stable across renders
  const currentKey = useMemo(() => globalTitleKey++, []);

  useIsomorphicLayoutEffect(() => {
    // Save original document title on first usage
    if (currentKey === 0) {
      originTitle = document.title;
    }

    // On unmount: remove this instance from title history and restore previous
    return () => {
      const item = titleHistoryMap.get(currentKey)!;
      const index = titleHistoryList.indexOf(item);

      titleHistoryList.splice(index, 1);
      titleHistoryMap.delete(currentKey);

      document.title =
        titleHistoryList.length === 0
          ? originTitle!
          : titleHistoryList[titleHistoryList.length - 1]!.title;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    // Update document title on every change
    document.title = title;

    const currentItem = titleHistoryMap.get(currentKey);

    if (currentItem) {
      // If the item already exists in the map, just update its title
      currentItem.title = title;
      return;
    }

    // If this is the first time this key is used, register it in history
    const newItem: TitleHistoryItem = {
      key: currentKey,
      title,
    };

    titleHistoryList.push(newItem);
    titleHistoryMap.set(currentKey, newItem);
  }, [title]);
}
