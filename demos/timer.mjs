import "../factories/index.js";
import { iteratorInterval } from "../sources/interval.js";

async function test() {
  const gen = iteratorInterval(10).stream().take(1);

  const first = gen.next();
  const second = gen.next();

  const aFirst = await first;
  const aSecond = await second;

  const result = [aFirst, aSecond].map((x) => x.value);

  console.log("RESULT", result);

  return result;
}

test().then(console.log);

process.stdin.lines().stream().take(1).forEach(console.log);

// iteratorInterval(300).stream().take(2).forEach(console.log);

// iteratorInterval(100).stream().take(5).forEach(console.log);
