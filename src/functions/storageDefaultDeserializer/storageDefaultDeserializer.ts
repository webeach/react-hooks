import { __DEVELOPMENT__ } from '../../constants/common';

export function storageDefaultDeserializer<Value>(
  key: string,
  rawValue: string,
): Value | undefined {
  try {
    const value: Record<'_', Value> = JSON.parse(rawValue);

    if ('_' in value) {
      return value._;
    }
  } catch (_error: unknown) {
    if (__DEVELOPMENT__) {
      console.error(
        `[useStorage] with key "${key}" error. Invalid deserializeValue to JSON: "${rawValue}"`,
      );
    }
  }

  return undefined;
}
