export function streamRandomBytes(): AsyncIterableIterator<number> {
  async function* randomSource() {
    while (true) {
      yield Math.random();
    }
  }

  return randomSource();
}
