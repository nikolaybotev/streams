export interface Splitter<T, U, R = U> {
  initial(): R;
  split(chunk: T, previous: R): [U[], R];
  last(remainder: R): U | null;
}

export const stringSplitter: Splitter<string, string, string> = {
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
