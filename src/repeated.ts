import { AsyncStream, asyncStream } from "./index";

export function streamRepeated<T>(value: T, count: number): AsyncStream<T> {
  async function* repeatedSource() {
    for (let i = 0; i < count; i++) {
      yield value;
    }
  }
  return asyncStream(repeatedSource());
}
