import { Readable } from "stream";

function makePipe<T>() {
  const puts: T[] = [];
  const takes: ((v: IteratorResult<T>) => void)[] = [];
  let closed = false;

  function put(n: T) {
    if (closed) {
      return;
    }
    const nextInLine = takes.shift();
    if (nextInLine) {
      nextInLine({ done: false, value: n });
    } else {
      puts.push(n);
    }
  }

  function close() {
    closed = true;
  }

  function next(): Promise<IteratorResult<T>> {
    const next = puts.shift();
    if (next) {
      return Promise.resolve({ done: false, value: next });
    }
    if (closed) {
      return Promise.resolve({ done: true, value: undefined });
    }

    return new Promise<IteratorResult<T>>((resolve) => takes.push(resolve));
  }

  return { put, next, close };
}

export interface Splitter<B, T, R> {
  initial(): R;
  split(chunk: B, previous: R): [T[], R];
  last(remainder: R): T | null;
}

export function readableAsyncIterator<T, R>(
  readable: Readable,
  by: Splitter<Buffer, T, R>,
): AsyncIterator<T> {
  const { next, ...pipe } = makePipe<T>();

  let remainder = by.initial();

  const dataListener = (chunk: Buffer) => {
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
