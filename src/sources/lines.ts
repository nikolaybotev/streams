import { Readable } from "stream";
import { Splitter, readableSplit } from "./readableAsyncIterator";

function stringSplitter(
  encoding?: BufferEncoding,
): Splitter<Buffer, string, string> {
  return {
    initial() {
      return "";
    },

    split(chunk: Buffer, previous: string) {
      const lines = chunk.toString(encoding).split("\n");

      lines[0] = previous + lines[0];
      const remainder = lines.pop() ?? "";

      return [lines, remainder];
    },

    last(remainder: string) {
      return remainder != "" ? remainder : null;
    },
  };
}

export function readableLines(
  readable: Readable,
  encoding: BufferEncoding = "utf-8",
): AsyncIterableIterator<string> {
  readable.setEncoding(encoding);
  return readableSplit(readable, stringSplitter(encoding), encoding);
}
