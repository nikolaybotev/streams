import { AsyncIterableStream } from "../index";

export function streamRange(
  startInclusive: number,
  endExclusive: number,
): AsyncIterableStream<number> {
  async function* rangeSource() {
    for (let i = startInclusive; i < endExclusive; i++) {
      yield i;
    }
  }
  return AsyncIterableStream.from(rangeSource());
}

export function streamClosedRange(
  startInclusive: number,
  endInclusive: number,
): AsyncIterableStream<number> {
  async function* rangeSource() {
    for (let i = startInclusive; i <= endInclusive; i++) {
      yield i;
    }
  }
  return AsyncIterableStream.from(rangeSource());
}
