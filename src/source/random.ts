import { AsyncIterableStream } from "../index";

export function streamRandomBytes(): AsyncIterableStream<number> {
  async function* randomSource() {
    while (true) {
      yield Math.random();
    }
  }

  return AsyncIterableStream.from(randomSource());
}
