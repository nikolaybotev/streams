import { makeAsyncGeneratorPair } from "../util/async-iterator-pair";

export type EventHandler<T> = (event: T) => unknown;

type EventEmitter<T> = {
  // jQuery and Node.js NodeEventTarget & EventEmitter
  // https://api.jquery.com/on/
  // https://nodejs.org/api/events.html
  on?(eventName: string | symbol, listener: EventHandler<T>): void;
  off?(eventName: string | symbol, listener: EventHandler<T>): void;

  // Node.js NodeEventTarget & EventEmitter
  // https://nodejs.org/api/events.html
  addListener?(eventName: string | symbol, listener: EventHandler<T>): void;
  removeListener?(eventName: string | symbol, listener: EventHandler<T>): void;

  // DOM EventTarget and Node.js EventTarget
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  // https://nodejs.org/api/events.html
  addEventListener?(
    eventName: string | symbol,
    listener: EventHandler<T>,
    options?: object,
  ): void;
  removeEventListener?(
    eventName: string | symbol,
    listener: EventHandler<T>,
    options?: object,
  ): void;
};

export function fromEvent<T>(
  target: EventEmitter<T>,
  eventName: string | symbol,
  options?: object,
): AsyncGenerator<T> {
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
  addHandler: (handler: EventHandler<T>) => void,
  removeHandler?: (handler: EventHandler<T>) => void,
): AsyncGenerator<T, undefined, unknown> {
  const [eventConsumer, eventProducer] = makeAsyncGeneratorPair<T, undefined>({
    onReturn: stop,
  });

  const eventHandler = (value: T) => eventProducer.next(value);

  function start() {
    addHandler(eventHandler);
  }

  function stop(): undefined {
    removeHandler?.(eventHandler);
  }

  async function* eventGenerator(): AsyncGenerator<T, undefined, unknown> {
    start();

    return yield* eventConsumer;
  }

  return eventGenerator();
}
