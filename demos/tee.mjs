import "../factories/index.js";
import "../operators/tee.js";
import { IteratorStream } from "../iterator-stream.js";

const source = Array(10).fill("A").values().streamAsync();

const teed = IteratorStream.from(source.tee()).take(3).toArray();

for (let i = 0; i < teed.length; i++) {
  for await (const a of teed[i]) {
    console.log(i, a);
  }
}

console.log("-- done --");
