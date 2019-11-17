import { AsyncStream, asyncStream } from "./index";

export function streamRange(
  startInclusive: number,
  endExclusive: number
): AsyncStream<number> {
  async function* rangeSource() {
    for (let i = startInclusive; i < endExclusive; i++) {
      yield i;
    }
  }
  return asyncStream(rangeSource());
}

export function streamClosedRange(
  startInclusive: number,
  endInclusive: number
): AsyncStream<number> {
  async function* rangeSource() {
    for (let i = startInclusive; i <= endInclusive; i++) {
      yield i;
    }
  }
  return asyncStream(rangeSource());
}
