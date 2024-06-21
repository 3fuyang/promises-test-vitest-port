# Promises/A+ Compliance Test Suite Vitest Port

This is a fork of the [Promises/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests), ported to [Vitest](https://vitest.dev/).

## How To Run

Import your own implementation of the Promises/A+ specification in the `adapter.js` file. Then, run the tests with the following command:

```bash
pnpm i

pnpm test
```

> See [Adapters](https://github.com/promises-aplus/promises-tests?tab=readme-ov-file#adapters).
