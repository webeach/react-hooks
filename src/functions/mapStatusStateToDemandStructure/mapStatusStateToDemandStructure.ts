import {
  StatusStateMap,
  StatusStateMapDemandStructure,
} from '../../types/status';

/**
 * Maps a `StatusStateMap` object to a demand structure array with named accessors.
 *
 * Each element in the returned array includes an `alias` and an `accessor` function
 * that lazily reads a specific property from the provided `statusState`.
 *
 * This structure is useful for tools like `useDemandStructure`, where each key is evaluated
 * only when accessed, and the structure tracks which values are actually used.
 *
 * @param statusState - The current status state object.
 * @returns A strictly ordered array of accessors for `isPending`, `isSuccess`, `isError`, and `error`.
 */
export function mapStatusStateToDemandStructure(statusState: StatusStateMap) {
  return [
    {
      alias: 'isPending',
      accessor: () => statusState.isPending,
    },
    {
      alias: 'isSuccess',
      accessor: () => statusState.isSuccess,
    },
    {
      alias: 'isError',
      accessor: () => statusState.isError,
    },
    {
      alias: 'error',
      accessor: () => statusState.error,
    },
  ] as StatusStateMapDemandStructure;
}
