export type SharedOptions<Args extends any[]> = {
  lastArgs: Args | null;
  lastCallTime: number;
  timeoutId: number | null;
};
