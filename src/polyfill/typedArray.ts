import { AsyncStream } from "../index";

declare global {
  interface Int8Array {
    asyncStream(): AsyncStream<number>;
  }
  interface Uint8Array {
    asyncStream(): AsyncStream<number>;
  }
  interface Uint8ClampedArray {
    asyncStream(): AsyncStream<number>;
  }
  interface Int16Array {
    asyncStream(): AsyncStream<number>;
  }
  interface Uint16Array {
    asyncStream(): AsyncStream<number>;
  }
  interface Int32Array {
    asyncStream(): AsyncStream<number>;
  }
  interface Uint32Array {
    asyncStream(): AsyncStream<number>;
  }
  interface Float32Array {
    asyncStream(): AsyncStream<number>;
  }
  interface Float64Array {
    asyncStream(): AsyncStream<number>;
  }
}

Int8Array.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
Uint8Array.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
Uint8ClampedArray.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
Int16Array.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
Uint16Array.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
Int32Array.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
Uint32Array.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
Float32Array.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
Float64Array.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
