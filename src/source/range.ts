export function streamRange(
  startInclusive: number,
  endExclusive: number,
): AsyncIterableIterator<number> {
  async function* rangeSource() {
    for (let i = startInclusive; i < endExclusive; i++) {
      yield i;
    }
  }
  return rangeSource();
}

export function streamClosedRange(
  startInclusive: number,
  endInclusive: number,
): AsyncIterableIterator<number> {
  async function* rangeSource() {
    for (let i = startInclusive; i <= endInclusive; i++) {
      yield i;
    }
  }
  return rangeSource();
}
