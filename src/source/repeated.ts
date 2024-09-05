export function streamRepeated<T>(
  value: T,
  count: number = Infinity,
): AsyncIterableIterator<T> {
  async function* repeatedSource() {
    for (let i = 0; i < count; i++) {
      yield value;
    }
  }
  return repeatedSource();
}
