export type UseDepsCompareFunction<ValueType = undefined> =
  ValueType extends undefined
    ? () => boolean
    : (prevValue: ValueType, nextValue: ValueType) => boolean;
