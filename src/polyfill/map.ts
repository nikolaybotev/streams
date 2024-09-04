import { AsyncStream } from "../index";

declare global {
  interface Map<K, V> {
    asyncStream(): AsyncStream<[K, V]>;
    asyncStreamKeys(): AsyncStream<K>;
    asyncStreamValues(): AsyncStream<V>;
  }
}

Map.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};

Map.prototype.asyncStreamKeys = function () {
  return AsyncStream.fromIterable(this.keys());
};

Map.prototype.asyncStreamValues = function () {
  return AsyncStream.fromIterable(this.values());
};
