import { AsyncIterableStream } from "../index";

export function streamRepeated<T>(
  value: T,
  count: number,
): AsyncIterableStream<T> {
  async function* repeatedSource() {
    for (let i = 0; i < count; i++) {
      yield value;
    }
  }
  return AsyncIterableStream.from(repeatedSource());
}
