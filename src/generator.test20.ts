// These tests are disabled by default. Run these tests by:
//
//   npm test -- --testRegex test20
//

test("generator mapping", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a: any = [1, 2, 3].values() as any;
    console.log("YAY");
    const s = Array.from(a.map(it => it * it)).join();
    expect(s).toEqual('1,4,9');
});
  
test("generator for mapping", () => {
    function *gen() {
        yield 1;
        yield 2;
        yield 3;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = gen() as any;
    console.log("YAY");
    const s = Array.from(a.filter(x => x > 1).map(it => it * it)).join();
    expect(s).toEqual('4,9');
});
