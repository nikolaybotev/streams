import { makeAsyncGeneratorPair } from "./async-iterator-pair";

export function makeAsyncIteratorTee<T>(
  iterator: AsyncIterator<T>,
): Generator<AsyncIterator<T>> {
  const producers = [] as {
    producer: AsyncGenerator<undefined, void, T>;
    stopped: boolean;
  }[];
  let stoppedProducerCount = 0;
  let completed = false;

  async function readLoop() {
    if (completed) {
      return;
    }

    try {
      const result = await iterator.next();
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
  }

  function teeNext(): IteratorResult<AsyncIterator<T>> {
    const producerIndex = producers.length;

    async function onConsumerReturn(): Promise<void> {
      const tee = producers[producerIndex];
      if (!tee.stopped) {
        tee.stopped = true;
        stoppedProducerCount += 1;
        if (stoppedProducerCount == producers.length) {
          completed = true;
          await iterator.return?.();
        }
      }
    }

    const [consumer, producer] = makeAsyncGeneratorPair<T>({
      onReturn: onConsumerReturn,
    });

    producers.push({ producer, stopped: false });

    return { value: consumer, done: false };
  }

  readLoop();

  // Wrap in a generator in order to expose iterator helpers
  function* iteratorTee() {
    yield* { [Symbol.iterator]: () => ({ next: teeNext }) };
  }

  return iteratorTee();
}
