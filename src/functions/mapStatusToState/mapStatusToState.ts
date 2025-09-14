import { ErrorLike } from '../../types/common';
import { Status, StatusStateMap } from '../../types/status';

/**
 * Maps a given `status` value and optional `error` to a structured state object.
 *
 * Returns a `StatusStateMap` object containing derived boolean flags:
 * - `isError` — true if status is `'error'`
 * - `isPending` — true if status is `'pending'`
 * - `isSuccess` — true if status is `'success'`
 * - `error` — passed `ErrorLike` if status is `'error'`, otherwise `null`
 *
 * @template StatusType - A subtype of `Status` (e.g. `'error'`, `'pending'`, `'success'`)
 * @param status - The current status value.
 * @param error - Optional error object (only relevant when `status === 'error'`).
 * @returns A structured object describing the current state with derived flags and optional error.
 *
 * @example
 * mapStatusToState('error', { message: 'Something went wrong' });
 * // → { isError: true, isPending: false, isSuccess: false, error: { message: '...' } }
 */
export function mapStatusToState<StatusType extends Status>(
  status: StatusType,
  error: StatusType extends 'error' ? ErrorLike | null : null = null,
) {
  return {
    error: status === 'error' ? error : null,
    isError: status === 'error',
    isPending: status === 'pending',
    isSuccess: status === 'success',
  } as StatusStateMap<StatusType>;
}
