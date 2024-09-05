import { streamSecureRandomBytes } from "./secureRandom";

test("streamSecureRandom generates 20 bytes", async () => {
  const gen = streamSecureRandomBytes(16);

  const result = await gen.take(20).toArray();

  expect(result).toHaveLength(20);
});
