import { Readable } from "node:stream";
import { makePipe } from "../util/pipe";

export interface Splitter<B, T, R> {
  initial(): R;
  split(chunk: B, previous: R): [T[], R];
  last(remainder: R): T | null;
}

export function readableAsyncIterator<T, R>(
  readable: Readable,
  by: Splitter<Buffer | string, T, R>,
): AsyncIterator<T> {
  const { next, ...pipe } = makePipe<T>();

  let remainder = by.initial();

  const dataListener = (chunk: Buffer | string) => {
    const [items, nextRemainder] = by.split(chunk, remainder);

    items.forEach(pipe.put);

    remainder = nextRemainder;
  };

  const endListener = () => {
    const lastItem = by.last(remainder);
    if (lastItem !== null) {
      pipe.put(lastItem);
    }

    cleanUp();
  };

  readable.on("data", dataListener);
  readable.on("end", endListener);

  function cleanUp() {
    pipe.close();
    readable.removeListener("data", dataListener);
    readable.removeListener("end", endListener);
  }

  function iteratorReturn(): Promise<IteratorResult<T>> {
    cleanUp();
    return Promise.resolve({ done: true, value: undefined });
  }

  return { next, return: iteratorReturn };
}
