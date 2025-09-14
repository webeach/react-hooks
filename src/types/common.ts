export type BaseFunction<ArgsType extends any[] = any[], ReturnType = any> = (
  ...args: ArgsType
) => ReturnType;

export interface ErrorLike {
  message: string;
}

export type PlainObject<ValueType = any> = Record<string, ValueType>;
