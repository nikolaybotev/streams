export function asAsyncIterable<T>(value: AsyncIterable<T> | AsyncIterator<T>) {
  return typeof value[Symbol.asyncIterator] === "function"
    ? (value as AsyncIterable<T>)
    : { [Symbol.asyncIterator]: () => value as AsyncIterator<T> };
}
