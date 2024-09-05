import { AsyncIterableStream } from "../index";

declare global {
  interface Int8Array {
    asyncStream(): AsyncIterableStream<number>;
  }
  interface Uint8Array {
    asyncStream(): AsyncIterableStream<number>;
  }
  interface Uint8ClampedArray {
    asyncStream(): AsyncIterableStream<number>;
  }
  interface Int16Array {
    asyncStream(): AsyncIterableStream<number>;
  }
  interface Uint16Array {
    asyncStream(): AsyncIterableStream<number>;
  }
  interface Int32Array {
    asyncStream(): AsyncIterableStream<number>;
  }
  interface Uint32Array {
    asyncStream(): AsyncIterableStream<number>;
  }
  interface Float32Array {
    asyncStream(): AsyncIterableStream<number>;
  }
  interface Float64Array {
    asyncStream(): AsyncIterableStream<number>;
  }
}

Int8Array.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
Uint8Array.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
Uint8ClampedArray.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
Int16Array.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
Uint16Array.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
Int32Array.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
Uint32Array.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
Float32Array.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
Float64Array.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
