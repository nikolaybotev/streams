// These tests are disabled by default. Run these tests by:
//
//   npm test -- --testRegex test22
//

test("map works as expected", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a: any = [1, 2, 3].values() as any;

  const s = Array.from(a.map((it) => it * it));

  expect(s).toEqual([1, 4, 9]);
});

test("filter and map work as expected", () => {
  function* gen() {
    yield 1;
    yield 2;
    yield 3;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = gen() as any;

  const s = Array.from(a.filter((x) => x > 1).map((it) => it * it));

  expect(s).toEqual([4, 9]);
});

test("reduce of empty iterator throws TypeError", () => {
  function* gen() {
    // Empty iterator
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = gen() as any;

  const s = () => a.reduce((a, b) => a + b);

  expect(s).toThrow(TypeError);
});

test("reduce of empty iterator with undefined initial element returns undefined", () => {
  function* gen() {
    // Empty iterator
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = gen() as any;

  const s = a.reduce((a, b) => a + b, undefined);

  expect(s).toBeUndefined();
});

test("reduce of single-element iterator returns single element", () => {
  function* gen() {
    yield 42;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = gen() as any;

  const s = a.reduce((a, b) => a + b);

  expect(s).toBe(42);
});
