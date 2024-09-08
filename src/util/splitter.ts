export interface Splitter<T, U> {
  split(chunk: T): U[];
  concat(a: U, b: U): U;
}

export function handleChunk<T, U>(
  splitter: Splitter<T, U>,
  chunk: T,
  previous: U | undefined,
): [U[], U] {
  const lines = splitter.split(chunk);

  if (previous !== undefined) {
    lines[0] = splitter.concat(previous, lines[0]);
  }
  const remainder = lines.pop()!;

  return [lines, remainder];
}

export const stringSplitter: Splitter<string, string> = {
  split: (chunk: string) => chunk.split("\n"),
  concat: (a: string, b: string) => a + b,
};
