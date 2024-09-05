import { Readable } from "stream";
import { createInterface } from "node:readline/promises";

export async function* readableLines(
  readable: Readable,
  encoding: BufferEncoding = "utf-8",
): AsyncGenerator<string> {
  readable.setEncoding(encoding);
  const rl = createInterface({
    input: readable,
  });
  try {
    while (true) {
      const line = rl.question("");
      yield line;
    }
  } finally {
    rl.close();
  }
}
