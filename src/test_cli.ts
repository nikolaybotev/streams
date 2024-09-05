import "./polyfill";

process.stdin
  .lines()
  .stream()
  .map((s) => s.toLocaleUpperCase())
  .filter((s) => s.length > 3)
  .batch(3)
  .take(2)
  .forEach(console.log)
  .then((_) => console.log("-- all done --"));

process.stdin
  .lines()
  .stream()
  .map((s) => s.toLocaleUpperCase())
  .take(2)
  .filter((s) => s.length > 0)
  .peek((s) => {
    if (s.length > 5) throw "too long!";
  })
  .max((a, b) => a.length - b.length)
  .then(console.log)
  .catch(console.error);

process.stdin
  .lines()
  .stream()
  .map((s) => s.substring(0, 2).toLocaleLowerCase())
  .forEach(console.log);
