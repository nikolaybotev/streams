import { AsyncStream, asyncStream } from "./index";

export function streamRandomBytes(): AsyncStream<number> {
  async function* randomSource() {
    while (true) {
      yield Math.random();
    }
  }

  return asyncStream(randomSource());
}
