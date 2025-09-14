import { useMemo, useState } from 'react';

import { mapStatusToState } from '../../functions/mapStatusToState';
import { ErrorLike } from '../../types/common';
import { Status } from '../../types/status';

import { UseStatusReturn } from './types';

/**
 * React hook that manages a discrete status state (`'initial'`, `'pending'`, `'success'`, `'error'`)
 * along with an optional error and derived boolean flags.
 *
 * Returns a merged object containing:
 * - status flags: `isError`, `isPending`, `isSuccess`
 * - the current `error` (only when status is `'error'`)
 * - control methods:
 *   - `setError(error?)` — sets status to `'error'` and stores the error
 *   - `setPending()` — sets status to `'pending'`
 *   - `setSuccess()` — sets status to `'success'`
 *   - `reset()` — resets status to `'initial'`
 *   - `setStatus(status)` — sets status manually
 *
 * @param defaultStatus - Optional initial status (defaults to `'initial'`)
 * @returns A combined structure of the current status state and helper methods
 *
 * @example
 * const status = useStatus();
 *
 * status.setPending();
 *
 * useEffect(() => {
 *   if (status.isError && status.error?.message) {
 *     showToast(status.error.message);
 *   }
 * }, [status.isError, status.error]);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useStatus.md
 */
export function useStatus(defaultStatus: Status = 'initial'): UseStatusReturn {
  const [currentError, setCurrentError] = useState<ErrorLike | null>(null);
  const [currentStatus, setCurrentStatus] = useState<Status>(defaultStatus);

  return useMemo<UseStatusReturn>(() => {
    return Object.assign(
      {
        reset: () => setCurrentStatus('initial'),
        setError: (error: ErrorLike | null = null) => {
          setCurrentError(error);
          setCurrentStatus('error');
        },
        setPending: () => setCurrentStatus('pending'),
        setStatus: setCurrentStatus,
        setSuccess: () => setCurrentStatus('success'),
      },
      mapStatusToState(currentStatus, currentError),
    );
  }, [currentError, currentStatus]);
}
