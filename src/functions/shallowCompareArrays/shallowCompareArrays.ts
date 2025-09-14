/**
 * Performs a shallow comparison between two arrays.
 *
 * Returns `true` if both arrays have the same length and all corresponding
 * elements are strictly equal (`===`) by position.
 *
 * Note:
 * - This function does not perform deep comparison of nested objects or arrays.
 * - It returns `true` only if the contents are strictly equal per index.
 * - It does not compare non-array values (you must pass actual arrays).
 *
 * @param firstArray - The first array to compare.
 * @param secondArray - The second array to compare.
 * @returns `true` if the arrays are shallowly equal, otherwise `false`.
 *
 * @example
 * shallowCompareArrays([1, 2, 3], [1, 2, 3]);     // true
 * shallowCompareArrays([1, 2], [1, 2, 3]);        // false
 * shallowCompareArrays([{ a: 1 }], [{ a: 1 }]);   // false (different references)
 * const shared = { a: 1 };
 * shallowCompareArrays([shared], [shared]);      // true
 */
export function shallowCompareArrays(
  firstArray: unknown[],
  secondArray: unknown[],
): boolean {
  if (firstArray === secondArray) {
    return true;
  }

  if (firstArray.length !== secondArray.length) {
    return false;
  }

  for (let index = 0; index < firstArray.length; index++) {
    if (firstArray[index] !== secondArray[index]) {
      return false;
    }
  }

  return true;
}
