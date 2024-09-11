export function* iteratorRandom(): Generator<number, void, unknown> {
  while (true) {
    yield Math.random();
  }
}
