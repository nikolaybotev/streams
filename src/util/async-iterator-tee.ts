import { makeAsyncGeneratorPair } from "./async-iterator-pair";

export function makeAsyncIteratorTee<T>(
  it: AsyncIterator<T>,
): Iterator<AsyncIterator<T>> {
  const producers = [] as {
    producer: AsyncGenerator<undefined, void, T>;
    stopped: boolean;
  }[];
  let stoppedProducerCount = 0;
  let allConsumersReturned = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function teeLoopSync() {
    if (allConsumersReturned) {
      return;
    }

    it.next().then(
      (result) => {
        if (!result.done) {
          producers.forEach(({ producer }) => producer.next(result.value));
        } else {
          producers.forEach(({ producer }) => producer.return(result.value));
        }

        teeLoopSync();
      },
      (e) => {
        producers.forEach(({ producer }) => producer.throw(e));

        teeLoopSync();
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function teeLoop() {
    if (allConsumersReturned) {
      return;
    }

    try {
      const result = await it.next();
      if (!result.done) {
        producers.forEach(({ producer }) => producer.next(result.value));
      } else {
        producers.forEach(({ producer }) => producer.return(result.value));
      }
    } catch (e) {
      producers.forEach(({ producer }) => producer.throw(e));
    }

    teeLoop();
  }

  function teeNext(): IteratorResult<AsyncIterator<T>> {
    const producerIndex = producers.length;

    async function onConsumerReturn(): Promise<void> {
      const tee = producers[producerIndex];
      if (!tee.stopped) {
        tee.stopped = true;
        stoppedProducerCount += 1;
        if (stoppedProducerCount == producers.length) {
          allConsumersReturned = true;
          await it.return?.();
        }
      }
    }

    const [consumer, producer] = makeAsyncGeneratorPair<T>({
      onReturn: onConsumerReturn,
    });

    producers.push({ producer, stopped: false });

    return { value: consumer, done: false };
  }

  teeLoopSync();

  return {
    next: teeNext,
  };
}
