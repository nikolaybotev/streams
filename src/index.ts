/**
 * An object containing factory methods for AsyncStream.
 *
 * ```
 * AsyncStream.from([1, 2, 3]).map(x => x * 2).forEach(console.log);
 * ```
 */
export const AsyncIterableStream = {
  from: asyncStreamFrom,
};

/**
 * An asynchronous stream that produces elements of type `T` on demand.
 *
 * This is an extension of the built-in `AsyncIterable<T>` protocol.
 *
 * The operations defined here in AsyncStream are a superset of the operations
 * described in the [Async Iterator Helpers](https://github.com/tc39/proposal-async-iterator-helpers)
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
 * wrapped in an AsyncStream like in this example:
 *
 * ```
 * import "streams/asyncGenerator";
 *
 * async function* generator() {
 *   yield* [1, 2, 3];
 * }
 *
 * generator()               // returns an AsyncGenerator
 *   .stream()               // convert to AsyncStream first!
 *   .forEach(console.log);  // use the AsyncStream APIs
 * ```
 */
export interface AsyncIterableStream<T> extends AsyncIterableIterator<T> {
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
  filter(predicate: (_: T) => boolean): AsyncIterableStream<T>;

  /**
   * Returns a new stream that transforms each element of this stream
   * using the provided function.
   *
   * See also [IteratorHelpers#map](https://github.com/tc39/proposal-iterator-helpers#mapmapperfn).
   *
   * @param transform a function to apply to each element of this stream
   */
  map<U>(transform: (_: T) => U): AsyncIterableStream<U>;

  /**
   * Like `map` but the `transform` is an async function that returns a Promise
   * and is awaited before producing the next transformed element.
   *
   * @param transform an async function to apply to each element of this stream
   */
  mapAwait<U>(transform: (_: T) => Promise<U>): AsyncIterableStream<U>;

  /**
   *
   * See also [IteratorHelpers#flatMap](https://github.com/tc39/proposal-iterator-helpers#flatmapmapperfn).
   *
   * @param transform
   */
  flatMap<U>(transform: (_: T) => AsyncIterable<U>): AsyncIterableStream<U>;

  flatMapAwait<U>(
    transform: (_: T) => Promise<AsyncIterable<U>>,
  ): AsyncIterableStream<U>;

  batch(batchSize: number): AsyncIterableStream<T[]>;

  /**
   * Returns a new stream that produces up to the first `limit` number of
   * elements of this stream.
   *
   * See also [IteratorHelpers#take](https://github.com/tc39/proposal-iterator-helpers#takelimit).
   *
   * @param limit the maximum number of items to produce
   */
  take(limit: number): AsyncIterableStream<T>;

  /**
   *
   * See also [IteratorHelpers#drop](https://github.com/tc39/proposal-iterator-helpers#droplimit).
   *
   * @param n
   */
  drop(n: number): AsyncIterableStream<T>;

  dropWhile(predicate: (_: T) => boolean): AsyncIterableStream<T>;

  takeWhile(predicate: (_: T) => boolean): AsyncIterableStream<T>;

  peek(observer: (_: T) => void): AsyncIterableStream<T>;

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
  collect<A, R>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher: (_: A) => R,
  ): Promise<R>;
  reduceLeft<R>(initial: R, accumulator: (r: R, t: T) => R): Promise<R>;

  /**
   *
   * See also [IteratorHelpers#reduce](https://github.com/tc39/proposal-iterator-helpers#reducereducer--initialvalue-).
   *
   * @param accumulator
   * @param initial
   */
  reduce(accumulator: (a: T, b: T) => T, initial?: T): Promise<T>;

  /**
   * Like {@link AsyncIterableStream#reduce()} but returns `undefined` if this stream is
   * empty instead of throwing `TypeError`.
   *
   * @param accumulator
   * @param initial
   */
  fold(accumulator: (a: T, b: T) => T, initial?: T): Promise<T | undefined>;

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
   * This is the same as the {@link first} method except that the predicate is
   * required.
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
// AsyncStream Implementation
//

class AsyncIterableStreamOfIterator<T>
  implements AsyncIterableStream<T>, AsyncIterableIterator<T>
{
  constructor(private readonly iterator: AsyncIterator<T>) {}

  stream() {
    return this;
  }

  // The AsyncIterator protocol
  next(...args: [] | [undefined]) {
    return this.iterator.next(...args);
  }

  readonly return = this.iterator.return
    ? (value?: unknown) => {
        return this.iterator.return!(value);
      }
    : undefined;

  readonly throw = this.iterator.throw
    ? (e?: unknown) => {
        return this.iterator.throw!(e);
      }
    : undefined;

  /**
   * @returns the AsyncIterator wrapped by this AsyncStream
   */
  [Symbol.asyncIterator]() {
    return this;
  }

  filter(predicate: (_: T) => boolean): AsyncIterableStream<T> {
    async function* filtered(it: AsyncIterableStream<T>) {
      for await (const v of it) {
        if (predicate(v)) {
          yield v;
        }
      }
    }
    return new AsyncIterableStreamOfIterator(filtered(this));
  }

  map<U>(transform: (_: T) => U): AsyncIterableStream<U> {
    function mapResult(sourceResult) {
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
      const sourceResult = this.iterator.next(...args);
      return mapResult(sourceResult);
    };

    const mappedIterator = { next: nextMapped } as AsyncIterator<U>;

    if (this.iterator.return) {
      mappedIterator.return = (value?) => {
        const sourceResult = this.iterator.return!(value);
        return mapResult(sourceResult);
      };
    }

    if (this.iterator.throw) {
      mappedIterator.throw = (e?) => {
        const sourceResult = this.iterator.throw!(e);
        return mapResult(sourceResult);
      };
    }
    return new AsyncIterableStreamOfIterator(mappedIterator);
  }

  mapAwait<U>(transform: (_: T) => Promise<U>): AsyncIterableStream<U> {
    async function* mapAwaited(it: AsyncIterableStream<T>) {
      for await (const v of it) {
        yield transform(v);
      }
    }
    return new AsyncIterableStreamOfIterator(mapAwaited(this));
  }

  flatMap<U>(transform: (_: T) => AsyncIterable<U>): AsyncIterableStream<U> {
    async function* flatMapped(it: AsyncIterableStream<T>) {
      for await (const nested of it) {
        yield* transform(nested);
      }
    }
    return new AsyncIterableStreamOfIterator(flatMapped(this));
  }

  flatMapAwait<U>(
    transform: (_: T) => Promise<AsyncIterable<U>>,
  ): AsyncIterableStream<U> {
    async function* flatMapAwaited(it: AsyncIterableStream<T>) {
      for await (const nested of it) {
        yield* await transform(nested);
      }
    }
    return new AsyncIterableStreamOfIterator(flatMapAwaited(this));
  }

  batch(batchSize: number): AsyncIterableStream<T[]> {
    if (batchSize < 1) {
      throw new Error("batchSize should be positive");
    }

    async function* batched(it: AsyncIterableStream<T>) {
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
    return new AsyncIterableStreamOfIterator(batched(this));
  }

  take(maxSize: number): AsyncIterableStream<T> {
    async function* limited(it: AsyncIterableStream<T>) {
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
    return new AsyncIterableStreamOfIterator(limited(this));
  }

  drop(n: number): AsyncIterableStream<T> {
    async function* skipped(it: AsyncIterableStream<T>) {
      let count = 0;
      for await (const v of it) {
        if (count >= n) {
          yield v;
        }
        count += 1;
      }
    }
    return new AsyncIterableStreamOfIterator(skipped(this));
  }

  dropWhile(predicate: (_: T) => boolean): AsyncIterableStream<T> {
    async function* droppedWhile(it: AsyncIterableStream<T>) {
      let dropping = true;
      for await (const v of it) {
        dropping = dropping && predicate(v);
        if (!dropping) {
          yield v;
        }
      }
    }
    return new AsyncIterableStreamOfIterator(droppedWhile(this));
  }

  takeWhile(predicate: (_: T) => boolean): AsyncIterableStream<T> {
    async function* takenWhile(it: AsyncIterableStream<T>) {
      for await (const v of it) {
        if (!predicate(v)) {
          return;
        }
        yield v;
      }
    }
    return new AsyncIterableStreamOfIterator(takenWhile(this));
  }

  peek(observer: (_: T) => void): AsyncIterableStream<T> {
    async function* peeked(it: AsyncIterableStream<T>) {
      for await (const v of it) {
        observer(v);
        yield v;
      }
    }
    return new AsyncIterableStreamOfIterator(peeked(this));
  }

  async forEach(block: (_: T) => unknown | Promise<unknown>): Promise<void> {
    for await (const v of this) {
      await block(v);
    }
  }

  async collect<A, R>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher: (_: A) => R,
  ): Promise<R> {
    for await (const v of this) {
      accumulator(container, v);
    }
    return finisher(container);
  }

  async reduceLeft<R>(initial: R, reducer: (r: R, t: T) => R): Promise<R> {
    let result = initial;
    for await (const v of this) {
      result = reducer(result, v);
    }
    return result;
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

  async reduce(adder: (a: T, b: T) => T, initial?: T): Promise<T> {
    const hasInitial = arguments.length >= 2;
    let firstItem = !hasInitial;
    let result = initial;
    for await (const v of this) {
      if (firstItem) {
        result = v;
        firstItem = false;
      } else {
        result = adder(result!, v);
      }
    }
    if (firstItem) {
      throw new TypeError("reduce without initial value but stream is empty");
    }
    return result!;
  }

  async fold(adder: (a: T, b: T) => T, initial?: T): Promise<T | undefined> {
    const hasInitial = arguments.length >= 2;
    let firstItem = !hasInitial;
    let result = initial;
    for await (const v of this) {
      if (firstItem) {
        result = v;
        firstItem = false;
      } else {
        result = adder(result!, v);
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
// AsyncStream Factory
//

function asyncStreamFrom<T>(
  it: Iterable<T> | Iterator<T> | AsyncIterable<T> | AsyncIterator<T>,
): AsyncIterableStream<T> {
  if (typeof it[Symbol.asyncIterator] === "function") {
    return new AsyncIterableStreamOfIterator(it[Symbol.asyncIterator]());
  }
  if (typeof it[Symbol.iterator] === "function") {
    return new AsyncIterableStreamOfIterator(it[Symbol.iterator]());
  }
  return new AsyncIterableStreamOfIterator(it as AsyncIterator<T>);
}
