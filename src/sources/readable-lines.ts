import "../factories/async-iterator";
import "../operators/async/split";
import { Readable } from "node:stream";
import { readableChunks } from "./readable-chunks";
import { stringSplitter } from "../util/splitter";

export function readableLines(
  readable: Readable,
  encoding: BufferEncoding = "utf-8",
): AsyncIterableIterator<string> {
  return readableChunks(readable, encoding).stream().split(stringSplitter);
}
