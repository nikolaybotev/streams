import { Readable } from "stream";
import { AsyncStream, asyncStream } from "./index";
import { Splitter, readableAsyncIterator } from "./readableAsyncIterator";

function stringSplitter(encoding?: BufferEncoding): Splitter<Buffer, string, string> {
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
    }
  };
}

export function streamLines(
  readable: Readable,
  encoding?: BufferEncoding
): AsyncStream<string> {
  return asyncStream(readableAsyncIterator(readable, stringSplitter(encoding)));
}
