import { AsyncIterableStream } from "../index";

declare global {
  interface Int8Array {
    streamAsync(): AsyncIterableStream<number>;
  }
  interface Uint8Array {
    streamAsync(): AsyncIterableStream<number>;
  }
  interface Uint8ClampedArray {
    streamAsync(): AsyncIterableStream<number>;
  }
  interface Int16Array {
    streamAsync(): AsyncIterableStream<number>;
  }
  interface Uint16Array {
    streamAsync(): AsyncIterableStream<number>;
  }
  interface Int32Array {
    streamAsync(): AsyncIterableStream<number>;
  }
  interface Uint32Array {
    streamAsync(): AsyncIterableStream<number>;
  }
  interface Float32Array {
    streamAsync(): AsyncIterableStream<number>;
  }
  interface Float64Array {
    streamAsync(): AsyncIterableStream<number>;
  }
}

Int8Array.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
Uint8Array.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
Uint8ClampedArray.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
Int16Array.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
Uint16Array.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
Int32Array.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
Uint32Array.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
Float32Array.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
Float64Array.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
