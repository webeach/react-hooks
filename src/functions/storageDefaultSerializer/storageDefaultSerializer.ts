export function storageDefaultSerializer<Value>(
  key: string,
  value: Value,
): string {
  return JSON.stringify({ _: value });
}
