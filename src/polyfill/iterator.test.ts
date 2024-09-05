import "./iterator";

test("the Array prototype is not modified", async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr = [1, 2, 3] as any;

  const f = () => arr.streamAsync();

  expect(f).toThrow(TypeError);
});

test("the String prototype is not modified", async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const str = "abc" as any;

  const f = () => str.streamAsync();

  expect(f).toThrow(TypeError);
});

test("IterableIterator.streamAsync works with generator functions", async () => {
  function* gen() {
    yield* [1, 2, 3];
  }

  const r = await gen()
    .streamAsync()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.streamAsync works with Array.keys()", async () => {
  const gen = [1, 2, 3].keys();

  const r = await gen
    .streamAsync()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([0, 2, 4]);
});

test("IterableIterator.streamAsync works with Array.values()", async () => {
  const gen = [1, 2, 3].values();

  const r = await gen
    .streamAsync()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.streamAsync works with TypedArray.keys()", async () => {
  const gen = Float64Array.of(1, 2, 3).keys();

  const r = await gen
    .streamAsync()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([0, 2, 4]);
});

test("IterableIterator.streamAsync works with TypedArray.values()", async () => {
  const gen = Float64Array.of(1, 2, 3).values();

  const r = await gen
    .streamAsync()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.streamAsync works with Map.keys()", async () => {
  const map = new Map<number, string>();
  map.set(1, "a");
  map.set(2, "b");
  map.set(3, "c");
  const gen = map.keys();

  const r = await gen
    .streamAsync()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.streamAsync works with Map.values()", async () => {
  const map = new Map<number, string>();
  map.set(1, "a");
  map.set(2, "b");
  map.set(3, "c");
  const gen = map.values();

  const r = await gen
    .streamAsync()
    .map((x) => x.toUpperCase())
    .toArray();

  expect(r).toEqual(["A", "B", "C"]);
});

test("IterableIterator.streamAsync works with Map.entries()", async () => {
  const map = new Map([
    [1, "a"],
    [2, "b"],
    [3, "c"],
  ]);
  const gen = map.entries();

  const r = await gen
    .streamAsync()
    .map(([k, v]) => [k + 1, v.toUpperCase()])
    .toArray();

  expect(r).toEqual([
    [2, "A"],
    [3, "B"],
    [4, "C"],
  ]);
});

test("IterableIterator.streamAsync works with Set.keys()", async () => {
  const set = new Set([1, 2, 3]);
  const gen = set.keys();

  const r = await gen
    .streamAsync()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.streamAsync works with Set.values()", async () => {
  const set = new Set([1, 2, 3]);
  const gen = set.values();

  const r = await gen
    .streamAsync()
    .map((x) => x * 3)
    .toArray();

  expect(r).toEqual([3, 6, 9]);
});

test("IterableIterator.streamAsync works with Set.entries()", async () => {
  const set = new Set([1, 2, 3]);
  const gen = set.entries();

  const r = await gen
    .streamAsync()
    .map(([k, v]) => [k * 2, v * 3])
    .toArray();

  expect(r).toEqual([
    [2, 3],
    [4, 6],
    [6, 9],
  ]);
});
