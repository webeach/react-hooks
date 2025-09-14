import { ErrorLike } from '../../types/common';
import { Status, StatusStateMap } from '../../types/status';

/**
 * Return type of the `useStatus` hook.
 *
 * Combines derived status flags (`isError`, `isPending`, `isSuccess`),
 * optional error value, and utility methods for updating status.
 */
export type UseStatusReturn = StatusStateMap & {
  /**
   * Resets status to `'initial'`.
   */
  reset: () => void;

  /**
   * Sets status to `'error'` and stores the given error.
   *
   * @param error - Optional error object.
   */
  setError: (error?: ErrorLike | null) => void;

  /**
   * Sets status to `'pending'`.
   */
  setPending: () => void;

  /**
   * Sets status to `'success'`.
   */
  setSuccess: () => void;

  /**
   * Manually sets the current status.
   *
   * @param status - One of the valid status values.
   */
  setStatus: (status: Status) => void;
};
