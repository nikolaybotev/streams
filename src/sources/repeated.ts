export function* iteratorRepeat<T>(
  value: T,
  count: number = Infinity,
): Generator<T, void, unknown> {
  for (let i = 0; i < count; i++) {
    yield value;
  }
}
