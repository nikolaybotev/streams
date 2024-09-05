import "./factories";

console.log("Start", process.stdin.readableFlowing);

process.stdin
  .lines()
  .stream()
  .take(2)
  .map((s) => s.substring(0, 2).toLocaleLowerCase())
  .forEach((s) => console.log(s, process.stdin.readableFlowing))
  .then(() => {
    console.log("- stdin is", process.stdin.readableFlowing);
    process.stdin
      .lines()
      .stream()
      .take(1)
      .map((s) => s.toUpperCase())
      .forEach((s) => console.log(s, process.stdin.readableFlowing))
      .then(() => console.log("End", process.stdin.readableFlowing));
  });
