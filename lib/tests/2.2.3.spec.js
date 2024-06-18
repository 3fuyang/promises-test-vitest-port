import { strictEqual } from "node:assert"
import { testRejected } from "./helpers/testThreeCases"
import { describe, it } from "vitest"
import { adapter } from "../adapter"

const rejected = adapter.rejected
const deferred = adapter.deferred

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it
const sentinel = { sentinel: "sentinel" } // a sentinel fulfillment value to test for with strict equality

describe("2.2.3: If `onRejected` is a function,", () => {
  describe.concurrent(
    "2.2.3.1: it must be called after `promise` is rejected, with `promise`’s rejection reason as its " +
      "first argument.",
    () => {
      testRejected(sentinel, (promise, done) => {
        promise.then(null, (reason) => {
          strictEqual(reason, sentinel)
          done()
        })
      })
    },
  )

  describe.concurrent(
    "2.2.3.2: it must not be called before `promise` is rejected",
    () => {
      it("rejected after a delay", async () => {
        await new Promise((done) => {
          const d = deferred()
          let isRejected = false

          d.promise.then(null, () => {
            strictEqual(isRejected, true)
            done()
          })

          setTimeout(() => {
            d.reject(dummy)
            isRejected = true
          }, 50)
        })
      })

      it("never rejected", async () => {
        await new Promise((done) => {
          const d = deferred()
          let onRejectedCalled = false

          d.promise.then(null, () => {
            onRejectedCalled = true
            done()
          })

          setTimeout(() => {
            strictEqual(onRejectedCalled, false)
            done()
          }, 150)
        })
      })
    },
  )

  describe.concurrent("2.2.3.3: it must not be called more than once.", () => {
    it("already-rejected", async () => {
      await new Promise((done) => {
        let timesCalled = 0

        rejected(dummy).then(null, () => {
          strictEqual(++timesCalled, 1)
          done()
        })
      })
    })

    it("trying to reject a pending promise more than once, immediately", async () => {
      await new Promise((done) => {
        const d = deferred()
        let timesCalled = 0

        d.promise.then(null, () => {
          strictEqual(++timesCalled, 1)
          done()
        })

        d.reject(dummy)
        d.reject(dummy)
      })
    })

    it("trying to reject a pending promise more than once, delayed", async () => {
      await new Promise((done) => {
        const d = deferred()
        let timesCalled = 0

        d.promise.then(null, () => {
          strictEqual(++timesCalled, 1)
          done()
        })

        setTimeout(() => {
          d.reject(dummy)
          d.reject(dummy)
        }, 50)
      })
    })

    it("trying to reject a pending promise more than once, immediately then delayed", async () => {
      await new Promise((done) => {
        const d = deferred()
        let timesCalled = 0

        d.promise.then(null, () => {
          strictEqual(++timesCalled, 1)
          done()
        })

        d.reject(dummy)
        setTimeout(() => {
          d.reject(dummy)
        }, 50)
      })
    })

    it("when multiple `then` calls are made, spaced apart in time", async () => {
      await new Promise((done) => {
        const d = deferred()
        const timesCalled = [0, 0, 0]

        d.promise.then(null, () => {
          strictEqual(++timesCalled[0], 1)
        })

        setTimeout(() => {
          d.promise.then(null, () => {
            strictEqual(++timesCalled[1], 1)
          })
        }, 50)

        setTimeout(() => {
          d.promise.then(null, () => {
            strictEqual(++timesCalled[2], 1)
            done()
          })
        }, 100)

        setTimeout(() => {
          d.reject(dummy)
        }, 150)
      })
    })

    it("when `then` is interleaved with rejection", async () => {
      await new Promise((done) => {
        const d = deferred()
        const timesCalled = [0, 0]

        d.promise.then(null, () => {
          strictEqual(++timesCalled[0], 1)
        })

        d.reject(dummy)

        d.promise.then(null, () => {
          strictEqual(++timesCalled[1], 1)
          done()
        })
      })
    })
  })
})
