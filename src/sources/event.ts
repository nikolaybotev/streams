import { makePipe } from "../util/pipe";

type EventHandler = (event) => unknown;

type EventEmitter = {
  // jQuery and Node.js NodeEventTarget & EventEmitter
  // https://api.jquery.com/on/
  // https://nodejs.org/api/events.html
  on?(eventName: string | symbol, listener: EventHandler): unknown;
  off?(eventName: string | symbol, listener: EventHandler): unknown;

  // Node.js NodeEventTarget & EventEmitter
  // https://nodejs.org/api/events.html
  addListener?(eventName: string | symbol, listener: EventHandler): unknown;
  removeListener?(eventName: string | symbol, listener: EventHandler): unknown;

  // DOM EventTarget and Node.js EventTarget
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  // https://nodejs.org/api/events.html
  addEventListener?(
    eventName: string | symbol,
    listener: EventHandler,
    options?: object,
  ): unknown;
  removeEventListener?(
    eventName: string | symbol,
    listener: EventHandler,
    options?: object,
  ): unknown;
};

export function fromEvent<T>(
  target: EventEmitter,
  eventName: string | symbol,
  options?: object,
): AsyncIterableIterator<T> {
  if (typeof target.on === "function") {
    return fromEventPattern(
      (handler) => target.on!(eventName, handler),
      (handler) => target.off?.(eventName, handler),
    );
  } else if (typeof target.addListener === "function") {
    return fromEventPattern(
      (handler) => target.addListener!(eventName, handler),
      (handler) => target.removeListener?.(eventName, handler),
    );
  } else if (typeof target.addEventListener === "function") {
    return fromEventPattern(
      (handler) => target.addEventListener!(eventName, handler, options),
      (handler) => target.removeEventListener?.(eventName, handler, options),
    );
  }
  throw new TypeError("unsupported event target");
}

export function fromEventPattern<T>(
  addHandler: (handler: EventHandler) => unknown,
  removeHandler?: (handler: EventHandler) => void,
): AsyncIterableIterator<T> {
  const { next, put, close } = makePipe<T>();

  addHandler(put);

  function end(): Promise<IteratorResult<T>> {
    // Clear the pipe buffers - no more reading after the iterator has been
    // consumed.
    close(true);
    removeHandler?.(put);
    return Promise.resolve({ done: true, value: undefined });
  }

  // Wrap the readable Iterator in an AsyncGenerator in order to ensure that
  // AsyncIterator Helpers are available where implemented by the runtime.
  const iterator = { next, return: end, throw: end };
  const iterable = { [Symbol.asyncIterator]: () => iterator };
  async function* generator() {
    yield* iterable;
  }

  return generator();
}
