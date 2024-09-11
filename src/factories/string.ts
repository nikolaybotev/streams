export {};

declare global {
  interface String {
    chars(): Generator<string, void, unknown>;
    charCodes(): Generator<number, void, unknown>;
    codePoints(): Generator<string, void, unknown>;
  }
}

String.prototype.chars = function () {
  function* stringChars(str: string) {
    for (let i = 0; i < str.length; i++) {
      yield str.charAt(i);
    }
  }
  return stringChars(this as string);
};

String.prototype.charCodes = function () {
  function* stringCharCodes(str: string) {
    for (let i = 0; i < str.length; i++) {
      yield str.charCodeAt(i);
    }
  }
  return stringCharCodes(this as string);
};

String.prototype.codePoints = function () {
  function* stringCodePoints(str: string) {
    yield* str;
  }
  return stringCodePoints(this as string);
};
