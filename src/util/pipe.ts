export function makePipe<T>() {
  const puts: [T, () => void][] = [];
  const takes: ((v: IteratorResult<T>) => void)[] = [];
  let closed = false;

  function put(n: T) {
    if (closed) {
      return;
    }
    const nextInLine = takes.shift();
    if (nextInLine) {
      nextInLine({ done: false, value: n });
      return Promise.resolve();
    } else {
      return new Promise<void>((resolve) => {
        puts.push([n, resolve]);
      });
    }
  }

  function close() {
    closed = true;
    takes.forEach((next) => next({ done: true, value: undefined }));
    takes.length = 0;
  }

  function next(): Promise<IteratorResult<T>> {
    const [next, resolveNext] = puts.shift() ?? [];
    if (next) {
      resolveNext!();
      return Promise.resolve({ done: false, value: next });
    }
    if (closed) {
      return Promise.resolve({ done: true, value: undefined });
    }

    return new Promise<IteratorResult<T>>((resolve) => takes.push(resolve));
  }

  return { put, next, close };
}
