export function makePipe<T>() {
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

  function close(clear: boolean = false) {
    closed = true;
    takes.length = 0;
    if (clear) {
      puts.length = 0;
    }
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
