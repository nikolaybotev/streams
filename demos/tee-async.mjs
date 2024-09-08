import "../factories/index.js";
import "../operators/tee.js";
import "../operators/async/tee-bp.js";
import { IteratorStream } from "../iterator-stream.js";
import { iteratorRange } from "../sources/range.js";
import { AsyncIteratorStream } from "../async-iterator-stream.js";

const source = iteratorRange(0, Infinity)
  .streamAsync()
  .map((i) => String.fromCharCode("A".charCodeAt(0) + i));

for (let i = 0; i < 2; i++) {
  const teed = IteratorStream.from(source.teeBp()).take(3).toArray();

  for (let i = 0; i < teed.length; i++) {
    for await (const a of AsyncIteratorStream.from(teed[i]).stream().take(3)) {
      console.log(i, a);
    }
  }

  for (let i = 0; i < teed.length; i++) {
    for await (const a of AsyncIteratorStream.from(teed[i]).stream().take(3)) {
      console.log(i, a);
    }
  }
}
console.log("-- done --");
