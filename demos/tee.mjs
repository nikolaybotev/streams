import "../factories/index.js";
import "../operators/tee.js";
import { IteratorStream } from "../iterator-stream.js";
import { iteratorRange } from "../sources/range.js";

const source = iteratorRange(0, 3)
  .stream()
  .map((i) => String.fromCharCode("A".charCodeAt(0) + i));

const teed = IteratorStream.from(source.tee()).take(3).toArray();

for (let i = 0; i < teed.length; i++) {
  for (const a of teed[i]) {
    console.log(i, a);
  }
}

console.log("-- done --");
