import "./iterator";
import "./async-iterator";

test("the Array prototype is not modified", async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr = [1, 2, 3] as any;

  const f = () => arr.toAsync();

  expect(f).toThrow(TypeError);
});

test("the String prototype is not modified", async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const str = "abc" as any;

  const f = () => str.toAsync();

  expect(f).toThrow(TypeError);
});

test("IterableIterator.toAsync works with generator functions", async () => {
  function* gen() {
    yield* [1, 2, 3];
  }

  const r = await gen()
    .toAsync()
    .stream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.toAsync works with Array.keys()", async () => {
  const gen = [1, 2, 3].keys();

  const r = await gen
    .toAsync()
    .stream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([0, 2, 4]);
});

test("IterableIterator.toAsync works with Array.values()", async () => {
  const gen = [1, 2, 3].values();

  const r = await gen
    .toAsync()
    .stream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.toAsync works with TypedArray.keys()", async () => {
  const gen = Float64Array.of(1, 2, 3).keys();

  const r = await gen
    .toAsync()
    .stream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([0, 2, 4]);
});

test("IterableIterator.toAsync works with TypedArray.values()", async () => {
  const gen = Float64Array.of(1, 2, 3).values();

  const r = await gen
    .toAsync()
    .stream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.toAsync works with Map.keys()", async () => {
  const map = new Map<number, string>();
  map.set(1, "a");
  map.set(2, "b");
  map.set(3, "c");
  const gen = map.keys();

  const r = await gen
    .toAsync()
    .stream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.toAsync works with Map.values()", async () => {
  const map = new Map<number, string>();
  map.set(1, "a");
  map.set(2, "b");
  map.set(3, "c");
  const gen = map.values();

  const r = await gen
    .toAsync()
    .stream()
    .map((x) => x.toUpperCase())
    .toArray();

  expect(r).toEqual(["A", "B", "C"]);
});

test("IterableIterator.toAsync works with Map.entries()", async () => {
  const map = new Map([
    [1, "a"],
    [2, "b"],
    [3, "c"],
  ]);
  const gen = map.entries();

  const r = await gen
    .toAsync()
    .stream()
    .map(([k, v]) => [k + 1, v.toUpperCase()])
    .toArray();

  expect(r).toEqual([
    [2, "A"],
    [3, "B"],
    [4, "C"],
  ]);
});

test("IterableIterator.toAsync works with Set.keys()", async () => {
  const set = new Set([1, 2, 3]);
  const gen = set.keys();

  const r = await gen
    .toAsync()
    .stream()
    .map((x) => x * 2)
    .toArray();

  expect(r).toEqual([2, 4, 6]);
});

test("IterableIterator.toAsync works with Set.values()", async () => {
  const set = new Set([1, 2, 3]);
  const gen = set.values();

  const r = await gen
    .toAsync()
    .stream()
    .map((x) => x * 3)
    .toArray();

  expect(r).toEqual([3, 6, 9]);
});

test("IterableIterator.toAsync works with Set.entries()", async () => {
  const set = new Set([1, 2, 3]);
  const gen = set.entries();

  const r = await gen
    .toAsync()
    .stream()
    .map(([k, v]) => [k * 2, v * 3])
    .toArray();

  expect(r).toEqual([
    [2, 3],
    [4, 6],
    [6, 9],
  ]);
});
