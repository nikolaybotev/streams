import "./factories";
import { iteratorInterval } from "./sources/interval";
import { logger } from "./test/helpers";

test("some() consumes iterator", async () => {
  // See https://github.com/tc39/proposal-iterator-helpers?tab=readme-ov-file#somefn
  async function* naturals() {
    let i = 0;
    while (true) {
      yield i;
      i += 1;
    }
  }

  const iter = naturals().stream().take(4);

  const result1 = await iter.some((v) => v > 1); // true
  const result2 = await iter.some((_) => true); // false, iterator is already consumed.

  expect(result1).toBe(true);
  expect(result2).toBe(false);
});

test("map() concurrent helpers - results are computed concurrently", async () => {
  // See https://github.com/tc39/proposal-async-iterator-helpers?tab=readme-ov-file#concurrency
  const log = logger();
  const gen = [50, 10]
    .values()
    .streamAsync()
    .map((n) =>
      iteratorInterval(n)
        .stream()
        .map((_) => n)
        .peek((v) => log(v))
        .first(),
    );

  const result = (await Promise.all([gen.next(), gen.next()])).map(
    (x) => x.value,
  );

  expect(result).toEqual([50, 10]);
  expect(log.output).toEqual([10, 50]);
});
