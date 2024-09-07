import "../factories/index.js";
import { makeAsyncIteratorTee } from "../util/async-iterator-tee.js";
import { IteratorStream } from "../iterator-stream.js";

const source = ["A", "B"].values().streamAsync();

const teed = IteratorStream.from(makeAsyncIteratorTee(source))
  .take(30)
  .toArray();

for (let i = 0; i < teed.length; i++) {
  for await (const a of teed[i]) {
    console.log(i, a);
  }
}

console.log("-- done --");
