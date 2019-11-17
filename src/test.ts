test("a", () => {
  let i: Iterable<any> = [];
  function* x(g: (_: any) => any = _ => _): Generator<number> {
    console.log("begin");
    yield g(0);
    console.log("end");
  }

  let a = x();

  console.log("gen");
  console.log(a.next());
  console.log(a.next());
  console.log("donee");
});

test("b", async () => {
  let i: Iterable<any> = [];
  function* x(g: (_: any) => any = _ => _): Generator<number> {
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
  async function* x(g: (_: any) => any = _ => _): AsyncGenerator<number> {
    console.log("begin");
    yield g(0);
    console.log("end");
    return "yes";
  }

  let a = x();

  console.log("next1");
  console.log(await a.next());
  console.log("next2");
  console.log(await a.next());
  console.log("donee");
});
