import { promisify } from "node:util";
import { randomBytes as randomBytesCb } from "node:crypto";

const randomBytes = promisify<number, Buffer>(randomBytesCb);

export async function* iteratorSecureRandom(
  bufferSize: number = 64,
): AsyncGenerator<number, undefined, unknown> {
  while (true) {
    const data = await randomBytes(bufferSize);
    yield* data;
  }
}
