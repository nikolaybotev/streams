# Streams

[![Node CI](https://github.com/nikolaybotev/streams/actions/workflows/nodejs.yml/badge.svg)](https://github.com/nikolaybotev/streams/actions/workflows/nodejs.yml)

A lazy streams library for functional composition in JavaScript.

```javascript
import "streams/polyfill";

process.stdin
  .streamLines()
  .map((s) => s.toLocaleUpperCase())
  .filter((s) => s.length > 3)
  .batch(3)
  .limit(2)
  .forEach(console.log)
  .then((_) => console.log("-- all done --"));
```
