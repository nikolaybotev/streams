import { AsyncIterableStream } from "../index";

declare global {
  interface Map<K, V> {
    streamAsync(): AsyncIterableStream<[K, V]>;
  }
}

Map.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
