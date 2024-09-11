import { asIterable } from "./util/as-iterable";

/**
 * An asynchronous stream that produces elements of type `T` on demand.
 *
 * This is an extension of the built-in `AsyncIterable<T>` protocol.
 *
 * The operations defined here in IteratorStream are a superset of the
 * operations described in the
 * [Iterator Helpers](https://github.com/tc39/proposal-iterator-helpers)
 * proposal.
 *
 * The behavior of all operations here that correspond to operations in the
 * `Iterator Helpers` proposal are defined (as best as possible) to match
 * exactly with the behavior of the corresponding `Iterator Helpers`
 * operations. This is intended to allow users of this library to seamlessly
 * switch between this library and the `Iterator Helpers` once those are
 * implemented and available.
 *
 * However, this library is NOT a polyfill for `Iterator Helpers`. To use
 * this library, an iterable iterator or generator needs to be explicitly
 * wrapped in an IteratorStream like in this example:
 *
 * ```
 * import "streams/sync";
 *
 * function* generator() {
 *   yield* [1, 2, 3];
 * }
 *
 * generator()               // returns an AsyncGenerator
 *   .stream()               // convert to IteratorStream first!
 *   .forEach(console.log);  // use the IteratorStream APIs
 * ```
 */
export class IteratorStream<T> implements Iterator<T, undefined, unknown> {
  /**
   * Creates an IteratorStream from a Iterator or Iterable.
   *
   * ```
   * IteratorStream.from([1, 2, 3]).map(x => x * 2).forEach(console.log);
   * ```
   */
  static from<T>(
    it: Iterable<T> | Iterator<T, unknown, undefined>,
  ): IteratorStream<T> {
    if (typeof it[Symbol.iterator] === "function") {
      return new IteratorStream(it[Symbol.iterator]());
    }
    return new IteratorStream(it as Iterator<T, unknown, undefined>);
  }

  readonly next: () => IteratorResult<T, undefined>;
  readonly return?: () => IteratorResult<T, undefined>;
  readonly throw?: (e?: unknown) => IteratorResult<T, undefined>;

  constructor(private readonly iterator: Iterator<T, unknown, undefined>) {
    this.next = () => this.iterator.next() as IteratorResult<T, undefined>;
    if (this.iterator.return !== undefined) {
      this.return = () =>
        this.iterator.return!() as IteratorResult<T, undefined>;
    }
    if (this.iterator.throw !== undefined) {
      this.throw = (e) =>
        this.iterator.throw!(e) as IteratorResult<T, undefined>;
    }
  }

  stream() {
    return this;
  }

  [Symbol.iterator]() {
    return this;
  }

  [Symbol.dispose]() {
    this.return?.();
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
  filter(predicate: (_: T) => boolean): IteratorStream<T> {
    function* filterOperator(it: Iterable<T>) {
      for (const v of it) {
        if (predicate(v)) {
          yield v;
        }
      }
    }
    return new IteratorStream(filterOperator(this));
  }

  /**
   * Returns a new stream that transforms each element of this stream
   * using the provided function.
   *
   * See also [IteratorHelpers#map](https://github.com/tc39/proposal-iterator-helpers#mapmapperfn).
   *
   * @param transform a function to apply to each element of this stream
   */
  map<U = T>(transform: (_: T) => U): IteratorStream<U> {
    function* mapOperator(it: Iterable<T>) {
      for (const v of it) {
        yield transform(v);
      }
    }
    return new IteratorStream(mapOperator(this));
  }

  /**
   *
   * See also [IteratorHelpers#flatMap](https://github.com/tc39/proposal-iterator-helpers#flatmapmapperfn).
   *
   * @param transform
   */
  flatMap<U>(
    transform: (_: T) => Iterable<U> | Iterator<U, unknown, undefined>,
  ): IteratorStream<U> {
    function* flatMapOperator(it: Iterable<T>) {
      for (const nested of it) {
        yield* asIterable(transform(nested));
      }
    }
    return new IteratorStream(flatMapOperator(this));
  }

  batch(batchSize: number): IteratorStream<T[]> {
    if (batchSize < 1) {
      throw new Error("batchSize should be positive");
    }

    function* batchOperator(it: Iterable<T>) {
      let acc: T[] = [];
      for (const v of it) {
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
    return new IteratorStream(batchOperator(this));
  }

  /**
   * Returns a new stream that produces up to the first `limit` number of
   * elements of this stream.
   *
   * See also [IteratorHelpers#take](https://github.com/tc39/proposal-iterator-helpers#takelimit).
   *
   * @param limit the maximum number of items to produce
   */
  take(limit: number): IteratorStream<T> {
    function* takeOperator(it: Iterable<T>) {
      let count = 0;
      if (count >= limit) {
        return;
      }
      for (const v of it) {
        yield v;
        count += 1;
        if (count >= limit) {
          return;
        }
      }
    }
    return new IteratorStream(takeOperator(this));
  }

  /**
   *
   * See also [IteratorHelpers#drop](https://github.com/tc39/proposal-iterator-helpers#droplimit).
   *
   * @param n
   */
  drop(n: number): IteratorStream<T> {
    function* dropOperator(it: Iterable<T>) {
      let count = 0;
      for (const v of it) {
        if (count >= n) {
          yield v;
        }
        count += 1;
      }
    }
    return new IteratorStream(dropOperator(this));
  }

  dropWhile(predicate: (_: T) => boolean): IteratorStream<T> {
    function* dropWhileOperator(it: Iterable<T>) {
      let dropping = true;
      for (const v of it) {
        dropping = dropping && predicate(v);
        if (!dropping) {
          yield v;
        }
      }
    }
    return new IteratorStream(dropWhileOperator(this));
  }

  takeWhile(predicate: (_: T) => boolean): IteratorStream<T> {
    function* takeWhileOperator(it: Iterable<T>) {
      for (const v of it) {
        if (!predicate(v)) {
          return;
        }
        yield v;
      }
    }
    return new IteratorStream(takeWhileOperator(this));
  }

  peek(observer: (_: T) => void): IteratorStream<T> {
    function* peekOperator(it: Iterable<T>) {
      for (const v of it) {
        observer(v);
        yield v;
      }
    }
    return new IteratorStream(peekOperator(this));
  }

  // #endregion Intermediate operations

  // #region Terminal operations

  /**
   *
   * See also [IteratorHelpers#forEach](https://github.com/tc39/proposal-iterator-helpers#foreachfn).
   *
   * @param block
   */
  forEach(block: (_: T) => unknown): void {
    for (const v of this) {
      block(v);
    }
  }

  collect<A, R = A>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher: (_: A) => R,
  ): R;
  collect<A>(container: A, accumulator: (a: A, t: T) => void): A;

  collect<A, R = A>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher?: (_: A) => R,
  ): R {
    for (const v of this) {
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
  every(predicate: (_: T) => boolean): boolean {
    for (const v of this) {
      if (!predicate(v)) {
        return false;
      }
    }
    return true;
  }

  /**
   * See also [IteratorHelpers#some](https://github.com/tc39/proposal-iterator-helpers#somefn).
   *
   * @param predicate
   */
  some(predicate: (_: T) => boolean): boolean {
    for (const v of this) {
      if (predicate(v)) {
        return true;
      }
    }
    return false;
  }

  none(predicate: (_: T) => boolean): boolean {
    for (const v of this) {
      if (predicate(v)) {
        return false;
      }
    }
    return true;
  }

  count(): number {
    let count = 0;
    for (const _ of this) {
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
  find(predicate: (_: T) => boolean): T | undefined {
    for (const v of this) {
      if (predicate(v)) {
        return v;
      }
    }
    return undefined;
  }

  first(predicate: (_: T) => boolean = (_) => true): T | undefined {
    for (const v of this) {
      if (predicate(v)) {
        return v;
      }
    }
    return undefined;
  }

  last(predicate: (_: T) => boolean = (_) => true): T | undefined {
    let result: T | undefined;
    for (const v of this) {
      if (predicate(v)) {
        result = v;
      }
    }
    return result;
  }

  max(comparator: (a: T, b: T) => number): T | undefined {
    let result: T | undefined;
    let firstItem = true;
    for (const v of this) {
      if (firstItem) {
        result = v;
        firstItem = false;
      } else {
        result = comparator(result!, v) > 0 ? result : v;
      }
    }
    return result;
  }

  min(comparator: (a: T, b: T) => number): T | undefined {
    let result: T | undefined;
    let firstItem = true;
    for (const v of this) {
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
  reduce<R = T>(reducer: (a: R, b: T) => R, initial?: R): R {
    const hasInitial = arguments.length >= 2;
    let firstItem = !hasInitial;
    let result = initial;
    for (const v of this) {
      if (firstItem) {
        result = v as unknown as R; // R assumed to be T when no initial value
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
  fold<R = T>(reducer: (a: R, b: T) => R, initial: R): R | undefined;
  fold(reducer: (a: T, b: T) => T): T | undefined;

  fold<R = T>(reducer: (a: R, b: T) => R, initial?: R): R | undefined {
    const hasInitial = arguments.length >= 2;
    let firstItem = !hasInitial;
    let result = initial;
    for (const v of this) {
      if (firstItem) {
        result = v as unknown as R; // R assumed to be T when no initial value
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
  toArray(): T[] {
    const result = [] as T[];
    for (const v of this) {
      result.push(v);
    }
    return result;
  }

  // #endregion Terminal operations
}
