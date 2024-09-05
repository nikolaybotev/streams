export function iteratorRandom(): Generator<number> {
  function* randomSource() {
    while (true) {
      yield Math.random();
    }
  }

  return randomSource();
}
