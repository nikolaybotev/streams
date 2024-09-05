import "./generator";

test("Generator.stream polyfill works with generator functions", async () => {
  function* gen() {
    yield* [1, 2, 3];
  }

  const r = await gen()
    .asyncStream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("Generator.stream polyfill works with Array.keys()", async () => {
  const gen = [1, 2, 3].keys();

  const r = await gen
    .asyncStream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([0, 2, 4]);
});

test("Generator.stream polyfill works with Array.values()", async () => {
  const gen = [1, 2, 3].values();

  const r = await gen
    .asyncStream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("Generator.stream polyfill works with Map.keys()", async () => {
  const map = new Map<number, string>();
  map.set(1, "a");
  map.set(2, "b");
  map.set(3, "c");
  const gen = map.keys();

  const r = await gen
    .asyncStream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("Generator.stream polyfill works with Map.values()", async () => {
  const map = new Map<number, string>();
  map.set(1, "a");
  map.set(2, "b");
  map.set(3, "c");
  const gen = map.values();

  const r = await gen
    .asyncStream()
    .map((x) => x.toUpperCase())
    .toArray();

  expect(r).toEqual(["A", "B", "C"]);
});

test("the Array prototype is untouched by the polyfill", async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr = [1, 2, 3] as any;

  const f = () => arr.stream();

  expect(f).toThrow(TypeError);
});
