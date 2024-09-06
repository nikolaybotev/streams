export function iteratorRange(
  start: number,
  end: number,
  options?: { step?: number; inclusive?: boolean } | number,
): Generator<number> {
  const { step = Math.sign(end - start), inclusive = false } =
    typeof options === "undefined"
      ? { step: Math.sign(end - start) }
      : typeof options === "number"
        ? { step: options }
        : options;
  if (end != start) {
    if (Math.sign(step) != Math.sign(end - start)) {
      throw new TypeError("step must be in the direction from start to end");
    }
  }

  function* rangeSource() {
    if (step == 0 && inclusive) {
      yield end;
      return;
    }

    const withinRange =
      end > start || step > 0
        ? inclusive
          ? (i) => i <= end
          : (i) => i < end
        : inclusive
          ? (i) => i >= end
          : (i) => i > end;

    for (let i = start; withinRange(i); i += step) {
      yield i;
    }
  }

  return rangeSource();
}
