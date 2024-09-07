export function fromIterator<T, TReturn = unknown, TNext = undefined>(
  iterator: Iterator<T, TReturn, TNext>,
): AsyncGenerator<T, TReturn, TNext> {
  const itAsync = {
    next: (...args: [] | [TNext]) => {
      return Promise.resolve(iterator.next(...args));
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  } as AsyncGenerator<T, TReturn, TNext>;

  if (iterator.return) {
    itAsync.return = async (value?: TReturn | PromiseLike<TReturn>) => {
      return iterator.return!(await value);
    };
  }

  if (iterator.throw) {
    itAsync.throw = (e?) => {
      return Promise.resolve(iterator.throw!(e));
    };
  }

  return itAsync;
}
