import { AsyncIterableStream } from "../index";
import { makePipe } from "../util/pipe";

export function streamInterval(
  periodMillis: number,
): AsyncIterableStream<number> {
  const { next, ...pipe } = makePipe<number>();

  let n = 0;
  const timer = setInterval(() => {
    pipe.put(n++);
  }, periodMillis);

  function iteratorReturn(): Promise<IteratorResult<number>> {
    pipe.close();
    clearInterval(timer);
    return Promise.resolve({ done: true, value: undefined });
  }

  return AsyncIterableStream.from({ next, return: iteratorReturn });
}
