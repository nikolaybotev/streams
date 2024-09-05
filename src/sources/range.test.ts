import { iteratorRange } from "./range";

test("streamRange with step 0 and start != end throws TypeError", () => {
  const f = () => iteratorRange(1, 2, 0);

  expect(f).toThrow(TypeError);
});

test("streamRange with step 0 and start == end is empty", () => {
  const f = () => iteratorRange(1, 1, 0);

  expect(Array.from(f())).toEqual([]);
});

test("streamRange with step 0 and start == end (inclusive) has 1 element", () => {
  const f = iteratorRange(1, 1, { step: 0, inclusive: true });

  expect(Array.from(f)).toEqual([1]);
});

test("streamRange with start == end is empty", () => {
  const f = () => iteratorRange(1, 1);

  expect(Array.from(f())).toEqual([]);
});

test("streamRange with start == end and step 1 is empty", () => {
  const f = () => iteratorRange(1, 1, 1);

  expect(Array.from(f())).toEqual([]);
});

test("streamRange with start == end and step -1 is empty", () => {
  const f = () => iteratorRange(1, 1, -1);

  expect(Array.from(f())).toEqual([]);
});

test("streamRange with start == end and step 1 inclusive has 1 element", () => {
  const f = () => iteratorRange(1, 1, { inclusive: true, step: 1 });

  expect(Array.from(f())).toEqual([1]);
});

test("streamRange with start == end and step -1 inclusive has 1 element", () => {
  const f = () => iteratorRange(1, 1, { inclusive: true, step: -1 });

  expect(Array.from(f())).toEqual([1]);
});

test("streamRange with step 1 and start > end throws TypeError", () => {
  const f = () => iteratorRange(2, 1, 1);

  expect(f).toThrow(TypeError);
});

test("streamRange from 1 to 3 step -0.5 throws TypeError", () => {
  const f = () => iteratorRange(1, 3, -0.5);

  expect(f).toThrow(TypeError);
});

test("streamRange from 1 to 3 works", () => {
  const f = iteratorRange(1, 3);

  expect(Array.from(f)).toEqual([1, 2]);
});

test("streamRange from 1 to 3 works", () => {
  const f = iteratorRange(1, 3);

  expect(Array.from(f)).toEqual([1, 2]);
});

test("streamRange from 1 to 3 inclusive works", () => {
  const f = iteratorRange(1, 3, { inclusive: true });

  expect(Array.from(f)).toEqual([1, 2, 3]);
});

test("streamRange from 3 to 1 works", () => {
  const f = iteratorRange(3, 1);

  expect(Array.from(f)).toEqual([3, 2]);
});

test("streamRange from 3 to 1 inclusive works", () => {
  const f = iteratorRange(3, 1, { inclusive: true });

  expect(Array.from(f)).toEqual([3, 2, 1]);
});

test("streamRange from 1 to 3 step 0.5 works", () => {
  const f = iteratorRange(1, 3, 0.5);

  expect(Array.from(f)).toEqual([1, 1.5, 2, 2.5]);
});
