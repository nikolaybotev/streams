import { Readable } from "node:stream";
import { createInterface } from "node:readline";
import { LinesOptions } from "./readable-lines";

export { LinesOptions } from "./readable-lines";

export async function* readableLines(
  readable: Readable,
  { encoding }: LinesOptions = { encoding: "utf-8" },
): AsyncGenerator<string, void, unknown> {
  if (encoding !== undefined) {
    readable.setEncoding(encoding);
  }
  const readline = createInterface({
    input: readable,
  });
  try {
    yield* readline;
  } finally {
    readline.close();
  }
}
