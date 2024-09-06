import "../factories/index.js";

process.stdin
  .lines()
  .stream()
  .map((s) => s.toLocaleUpperCase())
  .filter((s) => s.length > 3)
  .batch(3)
  .take(2)
  .forEach(console.log)
  .then((_) => console.log("-- all done --"));
