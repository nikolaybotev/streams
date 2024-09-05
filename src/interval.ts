import { AsyncStream } from "./index";
import { makePipe } from "./util/pipe";

export function streamInterval(periodMillis: number): AsyncStream<number> {
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

  return AsyncStream.from({ next, return: iteratorReturn });
}
