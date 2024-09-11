export async function* toAsync<T, TReturn = undefined, TNext = unknown>(
  iterator: Iterator<T, TReturn, TNext>,
): AsyncGenerator<T, TReturn, TNext> {
  return yield* { [Symbol.iterator]: () => iterator };
}
