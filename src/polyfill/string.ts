import { AsyncStream } from "../index";

declare global {
  interface String {
    charAsyncStream(): AsyncStream<string>;
  }
}

String.prototype.charAsyncStream = function () {
  return AsyncStream.fromIterable(this);
};
