import { BaseFunction } from '../../types/common';

export function isFunction<FunctionType extends BaseFunction = BaseFunction>(
  fn: unknown,
): fn is FunctionType {
  return typeof fn === 'function';
}
