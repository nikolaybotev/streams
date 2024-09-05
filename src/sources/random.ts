export function iteratorRandom(): IterableIterator<number> {
  function* randomSource() {
    while (true) {
      yield Math.random();
    }
  }

  return randomSource();
}
