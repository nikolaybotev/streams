import { AsyncIteratorStreamImpl } from "../../async-iterator-stream";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    teeBp(): Generator<AsyncGenerator<T>>;
  }
  interface AsyncIteratorStreamImpl<T> {
    teeBp(): Generator<AsyncGenerator<T>>;
  }
}

AsyncIteratorStreamImpl.prototype.teeBp = function <T>(): Generator<
  AsyncGenerator<T>
> {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  const buffers = [] as IteratorResult<T>[][];

  async function* producer() {
    while (true) {
      const next = await self.next();
      for (const buffer of buffers) {
        buffer.push(next);
      }
      if (next.done) {
        return;
      }
      yield;
    }
  }

  const produce = producer();

  function addConsumer(): AsyncGenerator<T> {
    const buffer = [] as IteratorResult<T>[];

    buffers.push(buffer);

    async function* consumer() {
      while (true) {
        if (buffer.length == 0) {
          await produce.next();
          if (buffer.length == 0) {
            return;
          }
        }
        const item = buffer.shift()!;
        if (item.done) {
          return item.value;
        }
        yield item.value;
      }
    }

    return consumer();
  }

  function* asyncIteratorTee() {
    yield* {
      [Symbol.iterator]: () => ({ next: () => ({ value: addConsumer() }) }),
    };
  }

  return asyncIteratorTee();
};
