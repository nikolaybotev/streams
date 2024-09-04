import "./asyncGenerator";

test("AsyncGenerator.stream polyfill works", async () => {
  async function* gen() {
    yield* [1, 2, 3];
  }

  const r = await gen()
    .stream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});
