import { toAsync } from "./sources/iterator";

/**
 * An object containing factory methods for AsyncIteratorStream.
 *
 * ```
 * AsyncIteratorStream.from([1, 2, 3]).map(x => x * 2).forEach(console.log);
 * ```
 */
export const AsyncIteratorStream = {
  from: asyncIteratorStreamFrom,
};

/**
 * An asynchronous stream that produces elements of type `T` on demand.
 *
 * This is an extension of the built-in `AsyncIterable<T>` protocol.
 *
 * The operations defined here in AsyncIteratorStream are a superset of the
 * operations described in the
 * [Async Iterator Helpers](https://github.com/tc39/proposal-async-iterator-helpers)
 * proposal.
 *
 * The behavior of all operations here that correspond to operations in the
 * `Async Iterator Helpers` proposal are defined (as best as possible) to match
 * exactly with the behavior of the corresponding `Async Iterator Helpers`
 * operations. This is intended to allow users of this library to seamlessly
 * switch between this library and the `Async Iterator Helpers` once those are
 * implemented and available.
 *
 * However, this library is NOT a polyfill for `Async Iterator Helpers`. To use
 * this library, an async iterable iterator or generator needs to be explicitly
 * wrapped in an AsyncIteratorStream like in this example:
 *
 * ```
 * import "streams/asyncGenerator";
 *
 * async function* generator() {
 *   yield* [1, 2, 3];
 * }
 *
 * generator()               // returns an AsyncGenerator
 *   .stream()               // convert to AsyncIteratorStream first!
 *   .forEach(console.log);  // use the AsyncIteratorStream APIs
 * ```
 */
export interface AsyncIteratorStream<T> extends AsyncIterableIterator<T> {
  //
  // Intermediate operations
  //

  /**
   * Returns a new stream that skips elements of this stream not matched by the
   * `predicate`.
   *
   * See also [IteratorHelpers#filter](https://github.com/tc39/proposal-iterator-helpers#filterfiltererfn).
   *
   * @param predicate a function that decides whether to include each element
   * in the new stream (true) or to exclude the element (false)
   */
  filter(predicate: (_: T) => boolean): AsyncIteratorStream<T>;

  /**
   * Returns a new stream that transforms each element of this stream
   * using the provided function.
   *
   * See also [IteratorHelpers#map](https://github.com/tc39/proposal-iterator-helpers#mapmapperfn).
   *
   * @param transform a function to apply to each element of this stream
   */
  map<U = T>(transform: (_: T) => U): AsyncIteratorStream<U>;

  /**
   * Like `map` but the result from each call to `transform` is awaited
   * before producing the next transformed element.
   *
   * @param transform an async function to apply to each element of this stream
   */
  mapAwait<U = T>(transform: (_: T) => Promise<U>): AsyncIteratorStream<U>;

  /**
   *
   * See also [IteratorHelpers#flatMap](https://github.com/tc39/proposal-iterator-helpers#flatmapmapperfn).
   *
   * @param transform
   */
  flatMap<U>(transform: (_: T) => AsyncIterable<U>): AsyncIteratorStream<U>;

  batch(batchSize: number): AsyncIteratorStream<T[]>;

  /**
   * Returns a new stream that produces up to the first `limit` number of
   * elements of this stream.
   *
   * See also [IteratorHelpers#take](https://github.com/tc39/proposal-iterator-helpers#takelimit).
   *
   * @param limit the maximum number of items to produce
   */
  take(limit: number): AsyncIteratorStream<T>;

  /**
   *
   * See also [IteratorHelpers#drop](https://github.com/tc39/proposal-iterator-helpers#droplimit).
   *
   * @param n
   */
  drop(n: number): AsyncIteratorStream<T>;

  dropWhile(predicate: (_: T) => boolean): AsyncIteratorStream<T>;

  takeWhile(predicate: (_: T) => boolean): AsyncIteratorStream<T>;

  peek(observer: (_: T) => void): AsyncIteratorStream<T>;

  //
  // Terminal operations
  //

  /**
   *
   * See also [IteratorHelpers#forEach](https://github.com/tc39/proposal-iterator-helpers#foreachfn).
   *
   * @param block
   */
  forEach(block: (_: T) => unknown | Promise<unknown>): Promise<void>;

  collect<A, R = A>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher: (_: A) => R,
  ): Promise<R>;
  collect<A>(container: A, accumulator: (a: A, t: T) => void): Promise<A>;

  /**
   *
   * See also [IteratorHelpers#reduce](https://github.com/tc39/proposal-iterator-helpers#reducereducer--initialvalue-).
   *
   * @param reducer
   * @param initial
   */
  reduce<R = T>(reducer: (a: R, b: T) => R, initial?: R): Promise<R>;

  /**
   * Like {@link reduce()} but returns `undefined` if this stream is empty
   * instead of throwing `TypeError`.
   *
   * @param reducer
   * @param initial
   */
  fold<R = T>(reducer: (a: R, b: T) => R, initial: R): Promise<R>;
  fold(reducer: (a: T, b: T) => T): Promise<T | undefined>;

  /**
   *
   * See also [IteratorHelpers#every](https://github.com/tc39/proposal-iterator-helpers#everyfn).
   *
   * @param predicate
   */
  every(predicate: (_: T) => boolean): Promise<boolean>;

  /**
   * See also [IteratorHelpers#some](https://github.com/tc39/proposal-iterator-helpers#somefn).
   *
   * @param predicate
   */
  some(predicate: (_: T) => boolean): Promise<boolean>;

  none(predicate: (_: T) => boolean): Promise<boolean>;

  count(): Promise<number>;

  /**
   * Returns the first element that matches the predicate.
   *
   * This is the same as the {@link first()} method except that the predicate is
   * required and a `TypeError` will be thrown if a predicate is not supplied.
   *
   * See also [IteratorHelpers#find](https://github.com/tc39/proposal-iterator-helpers#findfn).
   *
   * @param predicate
   */
  find(predicate: (_: T) => boolean): Promise<T | undefined>;

  first(predicate?: (_: T) => boolean): Promise<T | undefined>;

  last(predicate?: (_: T) => boolean): Promise<T | undefined>;

  max(comparator: (a: T, b: T) => number): Promise<T | undefined>;

  min(comparator: (a: T, b: T) => number): Promise<T | undefined>;

  /**
   * See also [IteratorHelpers#toArray](https://github.com/tc39/proposal-iterator-helpers#toarray).
   */
  toArray(): Promise<T[]>;
}

//
// AsyncIteratorStream Implementation
//

export class AsyncIteratorStreamImpl<T>
  implements AsyncIteratorStream<T>, AsyncIterableIterator<T>
{
  // The AsyncIterator protocol
  readonly next: (
    ...args: [] | [undefined]
  ) => Promise<IteratorResult<T, unknown>>;
  readonly return?: (value?: unknown) => Promise<IteratorResult<T, unknown>>;
  readonly throw?: (e?: unknown) => Promise<IteratorResult<T, unknown>>;

  constructor(private readonly iterator: AsyncIterator<T>) {
    this.next = (...args) => this.iterator.next(...args);
    if (this.iterator.return !== undefined) {
      this.return = (value) => this.iterator.return!(value);
    }
    if (this.iterator.throw !== undefined) {
      this.throw = (e) => this.iterator.throw!(e);
    }
  }

  stream() {
    return this;
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  filter(predicate: (_: T) => boolean): AsyncIteratorStream<T> {
    async function* filterOperator(it: AsyncIteratorStream<T>) {
      for await (const v of it) {
        if (predicate(v)) {
          yield v;
        }
      }
    }
    return new AsyncIteratorStreamImpl(filterOperator(this));
  }

  map<U = T>(transform: (_: T) => U): AsyncIteratorStream<U> {
    // Do not use a generator here, as it will await the result of the
    // transform before yielding each mapped value.
    // The Iterator Helpers proposal requires that we yield immediately
    // without awaiting the transform result to resolve.
    function mapOperator(it: AsyncIteratorStream<T>) {
      function mapResult(sourceResult: Promise<IteratorResult<T>>) {
        return new Promise<IteratorResult<U>>((resolve, reject) => {
          Promise.resolve(sourceResult).then((result) => {
            if (result.done) {
              resolve(result);
            } else {
              // transform could return a Promise...
              const transformed = transform(result.value);
              Promise.resolve(transformed).then(
                (value) => resolve({ value, done: false }),
                reject,
              );
            }
          }, reject);
        });
      }

      const nextMapped = (...args: [] | [undefined]) => {
        const sourceResult = it.next(...args);
        return mapResult(sourceResult);
      };

      const mappedIterator = { next: nextMapped } as AsyncIterator<U>;

      if (it.return) {
        mappedIterator.return = (value?) => {
          const sourceResult = it.return!(value);
          return mapResult(sourceResult);
        };
      }

      if (it.throw) {
        mappedIterator.throw = (e?) => {
          const sourceResult = it.throw!(e);
          return mapResult(sourceResult);
        };
      }

      return mappedIterator;
    }
    return new AsyncIteratorStreamImpl(mapOperator(this));
  }

  mapAwait<U = T>(transform: (_: T) => Promise<U>): AsyncIteratorStream<U> {
    async function* mapAwaitOperator(it: AsyncIteratorStream<T>) {
      for await (const v of it) {
        yield transform(v);
      }
    }
    return new AsyncIteratorStreamImpl(mapAwaitOperator(this));
  }

  flatMap<U>(transform: (_: T) => AsyncIterable<U>): AsyncIteratorStream<U> {
    async function* flatMapOperator(it: AsyncIteratorStream<T>) {
      for await (const nested of it) {
        yield* transform(nested);
      }
    }
    return new AsyncIteratorStreamImpl(flatMapOperator(this));
  }

  batch(batchSize: number): AsyncIteratorStream<T[]> {
    if (batchSize < 1) {
      throw new Error("batchSize should be positive");
    }

    async function* batchOperator(it: AsyncIteratorStream<T>) {
      let acc: T[] = [];
      for await (const v of it) {
        acc.push(v);
        if (acc.length === batchSize) {
          yield acc;
          acc = [];
        }
      }
      if (acc.length > 0) {
        yield acc;
      }
    }
    return new AsyncIteratorStreamImpl(batchOperator(this));
  }

  take(maxSize: number): AsyncIteratorStream<T> {
    async function* takeOperator(it: AsyncIteratorStream<T>) {
      let count = 0;
      if (count >= maxSize) {
        return;
      }
      for await (const v of it) {
        yield v;
        count += 1;
        if (count >= maxSize) {
          return;
        }
      }
    }
    return new AsyncIteratorStreamImpl(takeOperator(this));
  }

  drop(n: number): AsyncIteratorStream<T> {
    async function* dropOperator(it: AsyncIteratorStream<T>) {
      let count = 0;
      for await (const v of it) {
        if (count >= n) {
          yield v;
        }
        count += 1;
      }
    }
    return new AsyncIteratorStreamImpl(dropOperator(this));
  }

  dropWhile(predicate: (_: T) => boolean): AsyncIteratorStream<T> {
    async function* dropWhileOperator(it: AsyncIteratorStream<T>) {
      let dropping = true;
      for await (const v of it) {
        dropping = dropping && predicate(v);
        if (!dropping) {
          yield v;
        }
      }
    }
    return new AsyncIteratorStreamImpl(dropWhileOperator(this));
  }

  takeWhile(predicate: (_: T) => boolean): AsyncIteratorStream<T> {
    async function* takeWhileOperator(it: AsyncIteratorStream<T>) {
      for await (const v of it) {
        if (!predicate(v)) {
          return;
        }
        yield v;
      }
    }
    return new AsyncIteratorStreamImpl(takeWhileOperator(this));
  }

  peek(observer: (_: T) => void): AsyncIteratorStream<T> {
    async function* peekOperator(it: AsyncIteratorStream<T>) {
      for await (const v of it) {
        observer(v);
        yield v;
      }
    }
    return new AsyncIteratorStreamImpl(peekOperator(this));
  }

  async forEach(block: (_: T) => unknown | Promise<unknown>): Promise<void> {
    for await (const v of this) {
      await block(v);
    }
  }

  async collect<A, R = A>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher?: (_: A) => R,
  ): Promise<R> {
    for await (const v of this) {
      accumulator(container, v);
    }
    return finisher ? finisher(container) : (container as unknown as R);
  }

  async every(predicate: (_: T) => boolean): Promise<boolean> {
    for await (const v of this) {
      if (!(await predicate(v))) {
        return false;
      }
    }
    return true;
  }

  async some(predicate: (_: T) => boolean): Promise<boolean> {
    for await (const v of this) {
      if (await predicate(v)) {
        return true;
      }
    }
    return false;
  }

  async none(predicate: (_: T) => boolean): Promise<boolean> {
    for await (const v of this) {
      if (await predicate(v)) {
        return false;
      }
    }
    return true;
  }

  async count(): Promise<number> {
    let count = 0;
    for await (const _ of this) {
      count += 1;
    }
    return count;
  }

  async find(predicate: (_: T) => boolean): Promise<T | undefined> {
    for await (const v of this) {
      if (await predicate(v)) {
        return v;
      }
    }
    return undefined;
  }

  async first(
    predicate: (_: T) => boolean = (_) => true,
  ): Promise<T | undefined> {
    for await (const v of this) {
      if (await predicate(v)) {
        return v;
      }
    }
    return undefined;
  }

  async last(
    predicate: (_: T) => boolean = (_) => true,
  ): Promise<T | undefined> {
    let result: T | undefined;
    for await (const v of this) {
      if (await predicate(v)) {
        result = v;
      }
    }
    return result;
  }

  async max(comparator: (a: T, b: T) => number): Promise<T | undefined> {
    let result: T | undefined;
    let firstItem = true;
    for await (const v of this) {
      if (firstItem) {
        result = v;
        firstItem = false;
      } else {
        result = comparator(result!, v) > 0 ? result : v;
      }
    }
    return result;
  }

  async min(comparator: (a: T, b: T) => number): Promise<T | undefined> {
    let result: T | undefined;
    let firstItem = true;
    for await (const v of this) {
      if (firstItem) {
        result = v;
        firstItem = false;
      } else {
        result = comparator(result!, v) < 0 ? result : v;
      }
    }
    return result;
  }

  async reduce<R = T>(reducer: (a: R, b: T) => R, initial?: R): Promise<R> {
    const hasInitial = arguments.length >= 2;
    let firstItem = !hasInitial;
    let result = initial;
    for await (const v of this) {
      if (firstItem) {
        result = v as R; // R is assumed to be T when there is no initial value
        firstItem = false;
      } else {
        result = reducer(result!, v);
      }
    }
    if (firstItem) {
      throw new TypeError("reduce without initial value but stream is empty");
    }
    return result!;
  }

  async fold<R = T>(
    reducer: (a: R, b: T) => R,
    initial?: R,
  ): Promise<R | undefined> {
    const hasInitial = arguments.length >= 2;
    let firstItem = !hasInitial;
    let result = initial;
    for await (const v of this) {
      if (firstItem) {
        result = v as R; // R is assumed to be T when there is no initial value
        firstItem = false;
      } else {
        result = reducer(result!, v);
      }
    }
    return result;
  }

  async toArray(): Promise<T[]> {
    const result = [] as T[];
    for await (const v of this) {
      result.push(v);
    }
    return result;
  }
}

//
// AsyncIteratorStream Factory
//

function asyncIteratorStreamFrom<T>(
  it: Iterable<T> | AsyncIterable<T> | AsyncIterator<T>,
): AsyncIteratorStream<T> {
  if (typeof it[Symbol.asyncIterator] === "function") {
    return new AsyncIteratorStreamImpl(it[Symbol.asyncIterator]());
  }
  if (typeof it[Symbol.iterator] === "function") {
    return new AsyncIteratorStreamImpl(toAsync(it[Symbol.iterator]()));
  }
  return new AsyncIteratorStreamImpl(it as AsyncIterator<T>);
}
