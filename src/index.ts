export interface AsyncStream<T> extends AsyncIterable<T> {
  // Intermediate operations
  filter(predicate: (_: T) => boolean): AsyncStream<T>;
  map<U>(transform: (_: T) => U): AsyncStream<U>;
  mapAwait<U>(transform: (_: T) => Promise<U>): AsyncStream<U>;
  flatMap<U>(transform: (_: T) => AsyncStream<U>): AsyncStream<U>;
  flatMapAwait<U>(transform: (_: T) => Promise<AsyncStream<U>>): AsyncStream<U>;
  batch(batchSize: number): AsyncStream<T[]>;
  limit(maxSize: number): AsyncStream<T>;
  skip(n: number): AsyncStream<T>;
  dropWhile(predicate: (_: T) => boolean): AsyncStream<T>;
  takeWhile(predicate: (_: T) => boolean): AsyncStream<T>;
  peek(observer: (_: T) => void): AsyncStream<T>;

  // Terminal operations
  forEach(block: (_: T) => unknown | Promise<unknown>): Promise<void>;
  collect<A, R>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher: (_: A) => R,
  ): Promise<R>;
  reduceLeft<R>(initial: R, accumulator: (r: R, t: T) => R): Promise<R>;
  reduce(accumulator: (a: T, b: T) => T): Promise<T | null>;
  all(predicate: (_: T) => boolean): Promise<boolean>;
  any(predicate: (_: T) => boolean): Promise<boolean>;
  none(predicate: (_: T) => boolean): Promise<boolean>;
  count(): Promise<number>;
  first(predicate: (_: T) => boolean): Promise<T | null>;
  last(predicate: (_: T) => boolean): Promise<T | null>;
  max(comparator: (a: T, b: T) => number): Promise<T | null>;
  min(comparator: (a: T, b: T) => number): Promise<T | null>;
  toArray(): Promise<T[]>;
}

class AsyncStreamOfIterator<T> implements AsyncStream<T> {
  constructor(private readonly iterator: AsyncIterator<T>) {}

  [Symbol.asyncIterator]() {
    return this.iterator;
  }

  filter(predicate: (_: T) => boolean): AsyncStream<T> {
    async function* filtered(it: AsyncStream<T>) {
      for await (const v of it) {
        if (predicate(v)) {
          yield v;
        }
      }
    }
    return new AsyncStreamOfIterator(filtered(this));
  }

  map<U>(transform: (_: T) => U): AsyncStream<U> {
    async function* mapped(it: AsyncStream<T>) {
      for await (const v of it) {
        yield transform(v);
      }
    }
    return new AsyncStreamOfIterator(mapped(this));
  }

  mapAwait<U>(transform: (_: T) => Promise<U>): AsyncStream<U> {
    async function* mapAwaited(it: AsyncStream<T>) {
      for await (const v of it) {
        yield await transform(v);
      }
    }
    return new AsyncStreamOfIterator(mapAwaited(this));
  }

  flatMap<U>(transform: (_: T) => AsyncStream<U>): AsyncStream<U> {
    async function* flatMapped(it: AsyncStream<T>) {
      for await (const nested of it) {
        yield* transform(nested);
      }
    }
    return new AsyncStreamOfIterator(flatMapped(this));
  }

  flatMapAwait<U>(
    transform: (_: T) => Promise<AsyncStream<U>>,
  ): AsyncStream<U> {
    async function* flatMapAwaited(it: AsyncStream<T>) {
      for await (const nested of it) {
        yield* await transform(nested);
      }
    }
    return new AsyncStreamOfIterator(flatMapAwaited(this));
  }

  batch(batchSize: number): AsyncStream<T[]> {
    if (batchSize < 1) {
      throw new Error("batchSize should be positive");
    }

    async function* batched(it: AsyncStream<T>) {
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
    return new AsyncStreamOfIterator(batched(this));
  }

  limit(maxSize: number): AsyncStream<T> {
    async function* limited(it: AsyncStream<T>) {
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
    return new AsyncStreamOfIterator(limited(this));
  }

  skip(n: number): AsyncStream<T> {
    async function* skipped(it: AsyncStream<T>) {
      let count = 0;
      for await (const v of it) {
        if (count >= n) {
          yield v;
        }
        count += 1;
      }
    }
    return new AsyncStreamOfIterator(skipped(this));
  }

  dropWhile(predicate: (_: T) => boolean): AsyncStream<T> {
    async function* droppedWhile(it: AsyncStream<T>) {
      let dropping = true;
      for await (const v of it) {
        dropping = dropping && predicate(v);
        if (!dropping) {
          yield v;
        }
      }
    }
    return new AsyncStreamOfIterator(droppedWhile(this));
  }

  takeWhile(predicate: (_: T) => boolean): AsyncStream<T> {
    async function* takenWhile(it: AsyncStream<T>) {
      for await (const v of it) {
        if (!predicate(v)) {
          return;
        }
        yield v;
      }
    }
    return new AsyncStreamOfIterator(takenWhile(this));
  }

  peek(observer: (_: T) => void): AsyncStream<T> {
    async function* peeked(it: AsyncStream<T>) {
      for await (const v of it) {
        observer(v);
        yield v;
      }
    }
    return new AsyncStreamOfIterator(peeked(this));
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

  async all(predicate: (_: T) => boolean): Promise<boolean> {
    for await (const v of this) {
      if (!(await predicate(v))) {
        return false;
      }
    }
    return true;
  }

  async any(predicate: (_: T) => boolean): Promise<boolean> {
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

  async first(predicate: (_: T) => boolean): Promise<T | null> {
    for await (const v of this) {
      if (await predicate(v)) {
        return v;
      }
    }
    return null;
  }

  async last(predicate: (_: T) => boolean): Promise<T | null> {
    let result: T | null = null;
    for await (const v of this) {
      if (await predicate(v)) {
        result = v;
      }
    }
    return result;
  }

  async max(comparator: (a: T, b: T) => number): Promise<T | null> {
    let result: T | null = null;
    for await (const v of this) {
      if (result === null) {
        result = v;
      } else {
        result = comparator(result, v) > 0 ? result : v;
      }
    }
    return result;
  }

  async min(comparator: (a: T, b: T) => number): Promise<T | null> {
    let result: T | null = null;
    for await (const v of this) {
      if (result === null) {
        result = v;
      } else {
        result = comparator(result, v) < 0 ? result : v;
      }
    }
    return result;
  }

  async reduce(adder: (a: T, b: T) => T): Promise<T | null> {
    let result: T | null = null;
    for await (const v of this) {
      if (result === null) {
        result = v;
      } else {
        result = adder(result, v);
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

// Stream Sources

export function asyncStreamIterable<T>(itrbl: Iterable<T>): AsyncStream<T> {
  async function* iterableSource() {
    for (const e of itrbl) {
      yield e;
    }
  }
  return new AsyncStreamOfIterator(iterableSource());
}

export function streamAsyncIterable<T>(
  itrbl: AsyncIterable<T>,
): AsyncStream<T> {
  return new AsyncStreamOfIterator(itrbl[Symbol.asyncIterator]());
}

export function asyncStream<T>(
  it: Iterable<T> | AsyncIterable<T> | AsyncIterator<T>,
): AsyncStream<T> {
  if (typeof it[Symbol.iterator] === "function") {
    return asyncStreamIterable(it as Iterable<T>);
  }
  if (typeof it[Symbol.asyncIterator] === "function") {
    return streamAsyncIterable(it as AsyncIterable<T>);
  }
  return new AsyncStreamOfIterator(it as AsyncIterator<T>);
}
