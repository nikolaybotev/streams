export function* iteratorRandom(): Generator<number, undefined, unknown> {
  while (true) {
    yield Math.random();
  }
}
