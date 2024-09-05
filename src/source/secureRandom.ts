import { promisify } from "node:util";
import { randomBytes as randomBytesCb } from "node:crypto";

const randomBytes = promisify<number, Buffer>(randomBytesCb);

export function streamSecureRandomBytes(
  bufferSize: number = 64,
): AsyncIterableIterator<number> {
  async function* secureRandomSource() {
    while (true) {
      const data = await randomBytes(bufferSize);
      yield* data;
    }
  }

  return secureRandomSource();
}
