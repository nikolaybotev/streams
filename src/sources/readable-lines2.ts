import { Readable } from "node:stream";
import { createInterface } from "node:readline";

export async function* readableLines(
  readable: Readable,
  encoding: BufferEncoding = "utf-8",
): AsyncGenerator<string, void, undefined> {
  readable.setEncoding(encoding);
  const readline = createInterface({
    input: readable,
  });
  try {
    yield* readline;
  } finally {
    readline.close();
  }
}
