export function asIterable<T>(value: Iterable<T> | Iterator<T>) {
  return typeof value[Symbol.iterator] === "function"
    ? (value as Iterable<T>)
    : { [Symbol.iterator]: () => value as Iterator<T> };
}
