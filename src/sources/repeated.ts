export function iteratorRepeat<T>(
  value: T,
  count: number = Infinity,
): Generator<T> {
  function* repeatedSource() {
    for (let i = 0; i < count; i++) {
      yield value;
    }
  }
  return repeatedSource();
}
