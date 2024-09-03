function logger() {
  const output: unknown[] = [];

  const log = (...s: unknown[]) => {
    output.push(...s);
    console.log(...s);
  }

  log.output = output;

  return log;
}

test("generator without return statement has expected order of operations", () => {
  const log = logger();
  function* x(): Generator<number> {
    log("begin");
    yield 0;
    log("end");
  }

  const a = x();
  log("gen");
  log(a.next());
  log(a.next());
  log("donee");

  expect(log.output).toEqual([
    "gen",
    "begin",
    { value: 0, done: false },
    "end",
    { value: undefined, done: true },
    "donee"
  ])
});

test("generator completes before exception is handled", async () => {
  const log = logger();

  function* x(): Generator<number> {
    try {
      log("begin");
      yield 0;
      log("middle");
      yield 1;
      log("end");
    } catch (e) {
      log("ERROR", e);
    } finally {
      log("finally");
    }
  }

  let c = 0;
  try {
    for await (const n of x()) {
      log(`GOT ${c} elem`);
      if (c > 0) {
        throw "OOOOPS!!!";
      }
      log(`${c} == ${n}`);
      c += 1;
    }
  } catch (e) {
    log("TRAPPED in test", e);
  }

  expect(log.output).toEqual([
    "begin",
    "GOT 0 elem",
    "0 == 0",
    "middle",
    "GOT 1 elem",
    "finally",
    "TRAPPED in test",
    "OOOOPS!!!"
  ]);
});

test("generator with return statement has expected order of operations", async () => {
  const log = logger();
  async function* generator(): AsyncGenerator<number> {
    log("generator enters");
    yield 1;
    log("generator returns");
    return "result";
  }

  log("before calling generator");
  const a = generator();
  log("before first call to next");
  log(await a.next());
  log("before second call to next");
  log(await a.next());
  log("after consuming generator");

  expect(log.output).toEqual([
    "before calling generator",
    "before first call to next", // the async generator function does not start until the first call to next()
    "generator enters",
    { value: 1, done: false },
    "before second call to next",
    "generator returns",
    { value: "result", done: true },
    "after consuming generator",
  ]);
});

test("generator consumed via for loop has return value ignored", async () => {
  const log = logger();
  async function* generator(): AsyncGenerator<number> {
    log("generator enters");
    yield 1;
    log("generator returns");
    return "result";
  }

  const b = generator();
  for await (const x of b) {
    log(x);
  }
  log("after for-await");
  log(await b.next());

  expect(log.output).toEqual([
    "generator enters",
    1,
    "generator returns",
    "after for-await",
    { value: undefined, done: true }, // the return value is lost when iterator is consumed using "for [await] of"
  ]);
})

test("some() consumes iterator", async () => {
  // See https://github.com/tc39/proposal-iterator-helpers?tab=readme-ov-file#somefn
});

test("map() concurrent helpers - results are computed concurrently", async () => {
  // See https://github.com/tc39/proposal-async-iterator-helpers?tab=readme-ov-file#concurrency
});

test("map() passing the protocol", async () => {
  // See https://github.com/tc39/proposal-async-iterator-helpers/blob/main/DETAILS.md#passing-the-protocol
});
