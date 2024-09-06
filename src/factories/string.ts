export {};

declare global {
  interface String {
    chars(): Iterable<string>;
    charCodes(): Iterable<number>;
    codePoints(): Iterable<string>;
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
