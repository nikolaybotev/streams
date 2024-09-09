import "../factories/index.js";

console.log("Start", process.stdin.readableFlowing);

process.stdin
  .lines()
  .stream()
  .take(2)
  .map((s) => s.substring(0, 2).toLocaleLowerCase())
  .forEach((s) => console.log(s, process.stdin.readableFlowing));
