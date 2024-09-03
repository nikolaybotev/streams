test("a", () => {
  function* x(g: (_: number) => number = _ => _): Generator<number> {
    console.log("begin");
    yield g(0);
    console.log("end");
  }

  const a = x();

  console.log("gen");
  console.log(a.next());
  console.log(a.next());
  console.log("donee");
});

test("b", async () => {
  function* x(g: (_: number) => number = _ => _): Generator<number> {
    try {
      console.log("begin");
      yield g(0);
      console.log("middle");
      yield g(1);
      console.log("end");
    } catch (e) {
      console.log("ERROR", e);
    } finally {
      console.log("finally");
    }
  }
  let c = 0;
  try {
    for await (const n of x()) {
      console.log(`GOT ${c} elem`);
      if (c > 0) {
        throw "OOOOPS!!!";
      }
      console.log(`${c} == ${n}`);
      c += 1;
    }
  } catch (e) {
    console.log("TRAPPED in test", e);
  }
});

test("as", async () => {
  async function* x(g: (_: number) => number = _ => _): AsyncGenerator<number> {
    console.log("begin");
    yield g(0);
    console.log("end");
    return "yes";
  }

  const a = x();

  console.log("next1");
  console.log(await a.next());
  console.log("next2");
  console.log(await a.next());
  console.log("donee");
});
