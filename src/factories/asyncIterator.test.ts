import "./asyncIterator";

test("AsyncIterator.stream works with async generator", async () => {
  async function* gen() {
    yield* [1, 2, 3];
  }

  const r = await gen()
    .stream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("AsyncIterator.stream does NOT work with non-async generator", async () => {
  function* gen() {
    yield* [1, 2, 3];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = () => (gen() as any).stream();

  expect(f).toThrow(TypeError);
});

test("AsyncIterator.stream does NOT work with Array.values()", async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gen = [1, 2, 3].values() as any;

  const f = () => gen.stream();

  expect(f).toThrow(TypeError);
});
