// Tests that determine various behaviors of Iterator Helpers
//

import "./factories/asyncIterator";
import { iteratorInterval } from "./source/interval";

describe("tests that require Iterator Helpers", () => {
  // Skip these tests if the runtime does not have Iterator Helpers implemented
  const IteratorPrototype = Object.getPrototypeOf(
    Object.getPrototypeOf(Object.getPrototypeOf((function* () {})())),
  );
  if (typeof IteratorPrototype.map !== "function") {
    test.skip(`Skipping Iterator Helper tests on ${process?.version}`, () => {});
    return;
  }

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

  test("promises are not awaited by generators", () => {
    function* gen() {
      yield iteratorInterval(10).stream().first();
      yield iteratorInterval(10).stream().first();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = gen() as any;

    const result = a
      .map((x) => ({
        result: x,
      }))
      .toArray();

    expect(result).toHaveLength(2);
    expect(result[0].result).toBeInstanceOf(Promise);
    expect(result[1].result).toBeInstanceOf(Promise);
  });

  test("find requires a predicate", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = [].values() as any;

    expect(() => a.find()).toThrow(TypeError);
  });
});
