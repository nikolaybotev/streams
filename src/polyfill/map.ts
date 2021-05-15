import { AsyncStream, asyncStreamIterable } from "../index";

declare global {
  interface Map<K, V> {
    asyncStream(): AsyncStream<[K, V]>;
    asyncStreamKeys(): AsyncStream<K>;
    asyncStreamValues(): AsyncStream<V>;
  }
}

Map.prototype.asyncStream = function () {
  return asyncStreamIterable(this);
};

Map.prototype.asyncStreamKeys = function () {
  return asyncStreamIterable(this.keys());
};

Map.prototype.asyncStreamValues = function () {
  return asyncStreamIterable(this.values());
};
