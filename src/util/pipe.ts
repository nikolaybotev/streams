export function makePipe<T>() {
  type Message = { value?: T; error?: Error };
  type Resolver<X> = {
    resolve: (v: X) => void;
    reject: (e?: Error) => void;
  };

  const puts: [Message, () => void][] = [];
  const takes: Resolver<IteratorResult<T>>[] = [];
  let closed = false;

  function put(message: Message) {
    if (closed) {
      return Promise.resolve();
    }
    const nextInLine = takes.shift();

    if (nextInLine) {
      const { value, error } = message;
      if (value !== undefined) {
        nextInLine.resolve({ done: false, value });
      } else {
        nextInLine.reject(error!);
      }
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      puts.push([message, resolve]);
    });
  }

  function close() {
    closed = true;
    takes.forEach((next) => next.resolve({ done: true, value: undefined }));
    takes.length = 0;
  }

  function next(): Promise<IteratorResult<T>> {
    const [next, resolveNext] = puts.shift() ?? [];
    if (next) {
      resolveNext!();
      const { value, error } = next;
      if (value !== undefined) {
        return Promise.resolve({ done: false, value });
      } else {
        return Promise.reject(error);
      }
    }
    if (closed) {
      return Promise.resolve({ done: true, value: undefined });
    }

    return new Promise<IteratorResult<T>>((resolve, reject) =>
      takes.push({ resolve, reject }),
    );
  }

  return { put, next, close };
}
