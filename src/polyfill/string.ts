import { AsyncStream, asyncStreamIterable } from "../index";

declare global {
  interface String {
    charAsyncStream(): AsyncStream<string>;
  }
}

String.prototype.charAsyncStream = function() {
  return asyncStreamIterable(this);
};
