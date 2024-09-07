type Resolver<X> = {
  resolve: (v: X) => void;
  reject: (e?: Error) => void;
};

type Message<T, TReturn> = { m?: IteratorResult<T, TReturn>; error?: Error };
type Invocation<T, TReturn, TNext> = {
  message: Message<TNext, TReturn>;
  response?: Resolver<IteratorResult<T>>;
};

export function makeAsyncGeneratorPair<T, TReturn = void, TNext = undefined>(
  onReturn?: (sender?: AsyncIterator<unknown, TReturn, unknown>) => unknown,
  onThrow?: (sender?: AsyncIterator<unknown, TReturn, unknown>) => unknown,
): [AsyncGenerator<T, TReturn, TNext>, AsyncGenerator<TNext, TReturn, T>] {
  const puts: Invocation<T, TReturn, TNext>[] = [];
  const takes: Invocation<TNext, TReturn, T>[] = [];

  function makeAsyncGenerator<T, TNext>(
    name: string,
    puts: Invocation<T, TReturn, TNext>[],
    takes: Invocation<TNext, TReturn, T>[],
  ): AsyncGenerator<T, TReturn, TNext> {
    let done = false;

    function next(
      send: Message<TNext, TReturn>,
    ): Promise<IteratorResult<T, TReturn>> {
      if (done) {
        return Promise.resolve({ done: true, value: undefined as TReturn });
      }

      const { message: received, response } = takes.shift() ?? {};

      // The other side arrived first... close the link!
      if (received !== undefined) {
        // Send the other side our message
        if (response !== undefined) {
          const { m, error } = send;
          if (m !== undefined) {
            response.resolve(m);
          } else {
            response.reject(error!);
          }
        }

        // Special case: drain the other side's queue if done
        if (send.m?.done) {
          for (const { response } of takes) {
            response?.resolve({ done: true, value: undefined as TReturn });
          }
        }

        // Receive the other side's message.
        const { m, error } = received;
        if (m !== undefined) {
          if (m.done) {
            done = true;
          }
          return Promise.resolve(m);
        } else {
          return Promise.reject(error);
        }
      }

      // We are here first... send the other side our message and await
      // the other side's response.
      return new Promise((resolve, reject) => {
        puts.push({ message: send, response: { resolve, reject } });
      });
    }

    return {
      // @ts-expect-error for Debugging
      [Symbol.toStringTag]: `AsyncIterator${name}`,
      [Symbol.asyncIterator]() {
        return this;
      },
      next(value?) {
        return next({ m: { value: value!, done: false } });
      },
      return(value?) {
        onReturn?.(this);
        return next({ m: { value: value as TReturn, done: true } });
      },
      throw(error?) {
        (onThrow ?? onReturn)?.(this);
        return next({ error });
      },
    };
  }

  return [
    makeAsyncGenerator("Consumer", puts, takes),
    makeAsyncGenerator("Producer", takes, puts),
  ];
}
