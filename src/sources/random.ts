export function* iteratorRandom(): Generator<number> {
  while (true) {
    yield Math.random();
  }
}
