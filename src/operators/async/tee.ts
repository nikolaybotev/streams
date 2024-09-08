import { makeAsyncGeneratorPair } from "../../util/async-iterator-pair";

import { AsyncIteratorStreamImpl } from "../../async-iterator-stream";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    tee(): Generator<AsyncIterator<T>>;
  }
  interface AsyncIteratorStreamImpl<T> {
    tee(): Generator<AsyncIterator<T>>;
  }
}

AsyncIteratorStreamImpl.prototype.tee = function <T>(): Generator<
  AsyncIterator<T>
> {
  const producers = [] as {
    producer: AsyncGenerator<undefined, void, T>;
    stopped: boolean;
  }[];
  let stoppedProducerCount = 0;
  let completed = false;

  const readLoop = async () => {
    if (completed) {
      return;
    }

    try {
      const result = await this.next();
      if (!result.done) {
        producers.forEach(({ producer }) => producer.next(result.value));
      } else {
        completed = true;
        producers.forEach(({ producer }) => producer.return(result.value));
      }
    } catch (e) {
      producers.forEach(({ producer }) => producer.throw(e));
    }

    readLoop();
  };

  const teeNext = (): IteratorResult<AsyncIterator<T>> => {
    const producerIndex = producers.length;

    const onConsumerReturn = async (): Promise<void> => {
      const tee = producers[producerIndex];
      if (!tee.stopped) {
        tee.stopped = true;
        stoppedProducerCount += 1;
        if (stoppedProducerCount == producers.length) {
          completed = true;
          await this.return?.();
        }
      }
    };

    const [consumer, producer] = makeAsyncGeneratorPair<T>({
      onReturn: onConsumerReturn,
    });

    producers.push({ producer, stopped: false });

    return { value: consumer, done: false };
  };

  // Wrap in a generator in order to expose iterator helpers
  function* asyncIteratorTee() {
    readLoop();
    yield* { [Symbol.iterator]: () => ({ next: teeNext }) };
  }

  return asyncIteratorTee();
};
