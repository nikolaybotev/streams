export function logger() {
  const output: unknown[] = [];

  const log = (...s: unknown[]) => {
    output.push(...s);
    console.log(...s);
  };

  log.output = output;

  return log;
}
