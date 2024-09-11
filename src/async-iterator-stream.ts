import { toAsync } from "./sources/iterator";
import { asAsyncIterable } from "./util/as-async-iterable";

//
// AsyncIteratorStream Implementation
//

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
export class AsyncIteratorStream<T, TReturn = unknown>
  implements AsyncIterator<T, TReturn, unknown>
{
  /**
   * Creates an AsyncIteratorStream from an Iterator or Iterable.
   *
   * ```
   * AsyncIteratorStream.from([1, 2, 3]).map(x => x * 2).forEach(console.log);
   * ```
   */
  static from<T, TReturn = unknown>(
    it: Iterable<T> | AsyncIterable<T> | AsyncIterator<T, TReturn, unknown>,
  ): AsyncIteratorStream<T, TReturn> {
    if (typeof it[Symbol.asyncIterator] === "function") {
      return new AsyncIteratorStream(it[Symbol.asyncIterator]());
    }
    if (typeof it[Symbol.iterator] === "function") {
      return new AsyncIteratorStream(toAsync(it[Symbol.iterator]()));
    }
    return new AsyncIteratorStream(it as AsyncIterator<T, TReturn, unknown>);
  }

  // The AsyncIterator protocol
  readonly next: (
    ...args: [] | [unknown]
  ) => Promise<IteratorResult<T, TReturn>>;
  readonly return?: (
    value?: TReturn | PromiseLike<TReturn>,
  ) => Promise<IteratorResult<T, TReturn>>;
  readonly throw?: (e?: unknown) => Promise<IteratorResult<T, TReturn>>;

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

  async [Symbol.asyncDispose]() {
    await this.return?.();
  }

  // #region Intermediate operations

  /**
   * Returns a new stream that skips elements of this stream not matched by the
   * `predicate`.
   *
   * See also [IteratorHelpers#filter](https://github.com/tc39/proposal-iterator-helpers#filterfiltererfn).
   *
   * @param predicate a function that decides whether to include each element
   * in the new stream (true) or to exclude the element (false)
   */
  filter(predicate: (_: T) => boolean): AsyncIteratorStream<T, undefined> {
    async function* filterOperator(it: AsyncIterable<T>) {
      for await (const v of it) {
        if (predicate(v)) {
          yield v;
        }
      }
    }
    return new AsyncIteratorStream(filterOperator(this));
  }

  /**
   * Returns a new stream that transforms each element of this stream
   * using the provided function.
   *
   * See also [IteratorHelpers#map](https://github.com/tc39/proposal-iterator-helpers#mapmapperfn).
   *
   * @param transform a function to apply to each element of this stream
   */
  map<U = T>(transform: (_: T) => U): AsyncIteratorStream<U, undefined> {
    // Do not use a generator here, as it will await the result of the
    // transform before yielding each mapped value.
    // The Iterator Helpers proposal requires that we yield immediately
    // without awaiting the transform result to resolve.
    function mapOperator(itrbl: AsyncIterable<T>) {
      const it = itrbl[Symbol.asyncIterator]();
      function mapResult(sourceResult: Promise<IteratorResult<T>>) {
        return new Promise<IteratorResult<U, undefined>>((resolve, reject) => {
          Promise.resolve(sourceResult).then((result) => {
            if (result.done) {
              resolve({ done: true, value: undefined });
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

      const nextMapped = () => {
        const sourceResult = it.next();
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
    return new AsyncIteratorStream(mapOperator(this));
  }

  /**
   * Like `map` but the result from each call to `transform` is awaited
   * before producing the next transformed element.
   *
   * @param transform an async function to apply to each element of this stream
   */
  mapAwait<U = T>(
    transform: (_: T) => Promise<U>,
  ): AsyncIteratorStream<U, undefined> {
    async function* mapAwaitOperator(it: AsyncIterable<T>) {
      for await (const v of it) {
        yield transform(v);
      }
    }
    return new AsyncIteratorStream(mapAwaitOperator(this));
  }

  /**
   *
   * See also [IteratorHelpers#flatMap](https://github.com/tc39/proposal-iterator-helpers#flatmapmapperfn).
   *
   * @param transform
   */
  flatMap<U>(
    transform: (
      _: T,
    ) => AsyncIterable<U> | AsyncIterator<U, unknown, undefined>,
  ): AsyncIteratorStream<U, undefined> {
    async function* flatMapOperator(it: AsyncIterable<T>) {
      for await (const nested of it) {
        yield* asAsyncIterable(transform(nested));
      }
    }
    return new AsyncIteratorStream(flatMapOperator(this));
  }

  batch(batchSize: number): AsyncIteratorStream<T[], undefined> {
    if (batchSize < 1) {
      throw new Error("batchSize should be positive");
    }

    async function* batchOperator(it: AsyncIterable<T>) {
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
    return new AsyncIteratorStream(batchOperator(this));
  }

  /**
   * Returns a new stream that produces up to the first `limit` number of
   * elements of this stream.
   *
   * See also [IteratorHelpers#take](https://github.com/tc39/proposal-iterator-helpers#takelimit).
   *
   * @param limit the maximum number of items to produce
   */
  take(limit: number): AsyncIteratorStream<T, undefined> {
    async function* takeOperator(it: AsyncIterable<T>) {
      let count = 0;
      if (count >= limit) {
        return;
      }
      for await (const v of it) {
        yield v;
        count += 1;
        if (count >= limit) {
          return;
        }
      }
    }
    return new AsyncIteratorStream(takeOperator(this));
  }

  /**
   *
   * See also [IteratorHelpers#drop](https://github.com/tc39/proposal-iterator-helpers#droplimit).
   *
   * @param n
   */
  drop(n: number): AsyncIteratorStream<T, undefined> {
    async function* dropOperator(it: AsyncIterable<T>) {
      let count = 0;
      for await (const v of it) {
        if (count >= n) {
          yield v;
        }
        count += 1;
      }
    }
    return new AsyncIteratorStream(dropOperator(this));
  }

  dropWhile(predicate: (_: T) => boolean): AsyncIteratorStream<T, undefined> {
    async function* dropWhileOperator(it: AsyncIterable<T>) {
      let dropping = true;
      for await (const v of it) {
        dropping = dropping && predicate(v);
        if (!dropping) {
          yield v;
        }
      }
    }
    return new AsyncIteratorStream(dropWhileOperator(this));
  }

  takeWhile(predicate: (_: T) => boolean): AsyncIteratorStream<T, undefined> {
    async function* takeWhileOperator(it: AsyncIterable<T>) {
      for await (const v of it) {
        if (!predicate(v)) {
          return;
        }
        yield v;
      }
    }
    return new AsyncIteratorStream(takeWhileOperator(this));
  }

  peek(observer: (_: T) => void): AsyncIteratorStream<T, undefined> {
    async function* peekOperator(it: AsyncIterable<T>) {
      for await (const v of it) {
        observer(v);
        yield v;
      }
    }
    return new AsyncIteratorStream(peekOperator(this));
  }

  //
  // Terminal operations
  //

  /**
   *
   * See also [IteratorHelpers#forEach](https://github.com/tc39/proposal-iterator-helpers#foreachfn).
   *
   * @param block
   */
  async forEach(block: (_: T) => unknown | Promise<unknown>): Promise<void> {
    for await (const v of this) {
      await block(v);
    }
  }

  collect<A, R = A>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher: (_: A) => R,
  ): Promise<R>;
  collect<A>(container: A, accumulator: (a: A, t: T) => void): Promise<A>;

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

  /**
   *
   * See also [IteratorHelpers#every](https://github.com/tc39/proposal-iterator-helpers#everyfn).
   *
   * @param predicate
   */
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

  /**
   *
   * See also [IteratorHelpers#reduce](https://github.com/tc39/proposal-iterator-helpers#reducereducer--initialvalue-).
   *
   * @param reducer
   * @param initial
   */
  async reduce<R = T>(reducer: (a: R, b: T) => R, initial?: R): Promise<R> {
    const hasInitial = arguments.length >= 2;
    let firstItem = !hasInitial;
    let result = initial;
    for await (const v of this) {
      if (firstItem) {
        result = v as unknown as R; // R is assumed to be T when there is no initial value
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

  /**
   * Like {@link reduce()} but returns `undefined` if this stream is empty
   * instead of throwing `TypeError`.
   *
   * @param reducer
   * @param initial
   */
  async fold<R = T>(reducer: (a: R, b: T) => R, initial: R): Promise<R>;
  async fold(reducer: (a: T, b: T) => T): Promise<T | undefined>;

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

  /**
   * See also [IteratorHelpers#toArray](https://github.com/tc39/proposal-iterator-helpers#toarray).
   */
  async toArray(): Promise<T[]> {
    const result = [] as T[];
    for await (const v of this) {
      result.push(v);
    }
    return result;
  }
}
