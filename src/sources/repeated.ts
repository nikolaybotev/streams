export function* iteratorRepeat<T>(
  value: T,
  count: number = Infinity,
): Generator<T> {
  for (let i = 0; i < count; i++) {
    yield value;
  }
}
