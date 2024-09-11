export async function* toAsync<T, TReturn = unknown, TNext = unknown>(
  iterator: Iterator<T, TReturn, TNext>,
): AsyncGenerator<T, TReturn, TNext> {
  return yield* { [Symbol.iterator]: () => iterator };
}
