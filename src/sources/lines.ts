import { Readable } from "stream";
import { Splitter, readableAsyncIterator } from "./readableAsyncIterator";

function stringSplitter(): Splitter<string, string, string> {
  return {
    initial() {
      return "";
    },

    split(chunk: string, previous: string) {
      const lines = chunk.split("\n");

      lines[0] = previous + lines[0];
      const remainder = lines.pop() ?? "";

      return [lines, remainder];
    },

    last(remainder: string) {
      return remainder != "" ? remainder : null;
    },
  };
}

export function readLines(
  readable: Readable,
  encoding: BufferEncoding = "utf-8",
): AsyncIterableIterator<string> {
  readable.setEncoding(encoding);
  return readableAsyncIterator(readable, stringSplitter());
}
