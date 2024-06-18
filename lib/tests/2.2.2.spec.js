import { strictEqual } from "node:assert"
import { testFulfilled } from "./helpers/testThreeCases"
import { describe, it } from "vitest"
import { adapter } from "../adapter"

const resolved = adapter.resolved
const deferred = adapter.deferred

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it
const sentinel = { sentinel: "sentinel" } // a sentinel fulfillment value to test for with strict equality

describe("2.2.2: If `onFulfilled` is a function,", () => {
  describe.concurrent(
    "2.2.2.1: it must be called after `promise` is fulfilled, with `promise`’s fulfillment value as its " +
      "first argument.",
    () => {
      testFulfilled(sentinel, (promise, done) => {
        promise.then((value) => {
          strictEqual(value, sentinel)
          done()
        })
      })
    },
  )

  describe.concurrent(
    "2.2.2.2: it must not be called before `promise` is fulfilled",
    () => {
      it("fulfilled after a delay", async () => {
        await new Promise((done) => {
          const d = deferred()
          let isFulfilled = false

          d.promise.then(() => {
            strictEqual(isFulfilled, true)
            done()
          })

          setTimeout(() => {
            d.resolve(dummy)
            isFulfilled = true
          }, 50)
        })
      })

      it("never fulfilled", async () => {
        await new Promise((done) => {
          const d = deferred()
          let onFulfilledCalled = false

          d.promise.then(() => {
            onFulfilledCalled = true
            done()
          })

          setTimeout(() => {
            strictEqual(onFulfilledCalled, false)
            done()
          }, 150)
        })
      })
    },
  )

  describe.concurrent("2.2.2.3: it must not be called more than once.", () => {
    it("already-fulfilled", async () => {
      await new Promise((done) => {
        let timesCalled = 0

        resolved(dummy).then(() => {
          strictEqual(++timesCalled, 1)
          done()
        })
      })
    })

    it("trying to fulfill a pending promise more than once, immediately", async () => {
      await new Promise((done) => {
        const d = deferred()
        let timesCalled = 0

        d.promise.then(() => {
          strictEqual(++timesCalled, 1)
          done()
        })

        d.resolve(dummy)
        d.resolve(dummy)
      })
    })

    it("trying to fulfill a pending promise more than once, delayed", async () => {
      await new Promise((done) => {
        const d = deferred()
        let timesCalled = 0

        d.promise.then(() => {
          strictEqual(++timesCalled, 1)
          done()
        })

        setTimeout(() => {
          d.resolve(dummy)
          d.resolve(dummy)
        }, 50)
      })
    })

    it("trying to fulfill a pending promise more than once, immediately then delayed", async () => {
      await new Promise((done) => {
        const d = deferred()
        let timesCalled = 0

        d.promise.then(() => {
          strictEqual(++timesCalled, 1)
          done()
        })

        d.resolve(dummy)
        setTimeout(() => {
          d.resolve(dummy)
        }, 50)
      })
    })

    it("when multiple `then` calls are made, spaced apart in time", async () => {
      await new Promise((done) => {
        const d = deferred()
        const timesCalled = [0, 0, 0]

        d.promise.then(() => {
          strictEqual(++timesCalled[0], 1)
        })

        setTimeout(() => {
          d.promise.then(() => {
            strictEqual(++timesCalled[1], 1)
          })
        }, 50)

        setTimeout(() => {
          d.promise.then(() => {
            strictEqual(++timesCalled[2], 1)
            done()
          })
        }, 100)

        setTimeout(() => {
          d.resolve(dummy)
        }, 150)
      })
    })

    it("when `then` is interleaved with fulfillment", async () => {
      await new Promise((done) => {
        const d = deferred()
        const timesCalled = [0, 0]

        d.promise.then(() => {
          strictEqual(++timesCalled[0], 1)
        })

        d.resolve(dummy)

        d.promise.then(() => {
          strictEqual(++timesCalled[1], 1)
          done()
        })
      })
    })
  })
})
