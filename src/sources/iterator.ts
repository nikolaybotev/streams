import { asIterable } from "../util/as-iterable";

export async function* toAsync<T, TReturn = unknown, TNext = unknown>(
  iterator: Iterable<T> | Iterator<T, TReturn, TNext>,
): AsyncGenerator<T, TReturn, TNext> {
  return yield* asIterable(iterator);
}
