import { AsyncStream } from "./index";
import { promisify } from "util";
import { randomBytes as randomBytesCb } from "crypto";

const randomBytes = promisify<number, Buffer>(randomBytesCb);

export function streamSecureRandomBytes(
  bufferSize: number = 64,
): AsyncStream<number> {
  async function* secureRandomSource() {
    while (true) {
      const data = await randomBytes(bufferSize);
      for (const byte of data) {
        yield byte;
      }
    }
  }

  return AsyncStream.fromIterator(secureRandomSource());
}
