export function* iteratorRepeat<T>(
  value: T,
  count: number = Infinity,
): Generator<T, undefined, unknown> {
  for (let i = 0; i < count; i++) {
    yield value;
  }
}
