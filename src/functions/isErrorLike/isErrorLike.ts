import { ErrorLike } from '../../types/common';

export function isErrorLike(error: any): error is ErrorLike {
  return (
    error === null ||
    (typeof error === 'object' && typeof error.message === 'string')
  );
}
