import "../factories/async-iterator";
import { iteratorSecureRandom } from "./secure-random";

test("streamSecureRandom generates 20 bytes", async () => {
  const gen = iteratorSecureRandom(16);

  const result = await gen.stream().take(20).toArray();

  expect(result).toHaveLength(20);
});
