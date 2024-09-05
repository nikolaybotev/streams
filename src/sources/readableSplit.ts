import { Readable } from "node:stream";
import { readableChunks } from "./readableChunks";

export interface Splitter<B, T, R = T> {
  initial(): R;
  split(chunk: B, previous: R): [T[], R];
  last(remainder: R): T | null;
}

export async function* readableSplit<T, R = T>(
  readable: Readable,
  by: Splitter<Buffer, T, R>,
  encoding?: BufferEncoding,
): AsyncIterableIterator<T> {
  let remainder = by.initial();
  for await (const chunk of readableChunks(readable, encoding)) {
    const [items, nextRemainder] = by.split(chunk, remainder);
    yield* items;
    remainder = nextRemainder;
  }

  const lastItem = by.last(remainder);
  if (lastItem !== null) {
    yield lastItem;
  }
}
