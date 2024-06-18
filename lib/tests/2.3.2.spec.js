import { strictEqual } from "node:assert"
import { describe, it } from "vitest"
import { adapter } from "../adapter"

const resolved = adapter.resolved
const rejected = adapter.rejected
const deferred = adapter.deferred

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it
const sentinel = { sentinel: "sentinel" } // a sentinel fulfillment value to test for with strict equality

describe("2.3.2: If `x` is a promise, adopt its state", () => {
  describe.concurrent(
    "2.3.2.1: If `x` is pending, `promise` must remain pending until `x` is fulfilled or rejected.",
    () => {
      function xFactory() {
        return deferred().promise
      }

      testPromiseResolution(xFactory, (promise, done) => {
        let wasFulfilled = false
        let wasRejected = false

        promise.then(
          () => {
            wasFulfilled = true
          },
          () => {
            wasRejected = true
          },
        )

        setTimeout(() => {
          strictEqual(wasFulfilled, false)
          strictEqual(wasRejected, false)
          done()
        }, 100)
      })
    },
  )

  describe("2.3.2.2: If/when `x` is fulfilled, fulfill `promise` with the same value.", () => {
    describe.concurrent("`x` is already-fulfilled", () => {
      function xFactory() {
        return resolved(sentinel)
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then((value) => {
          strictEqual(value, sentinel)
          done()
        })
      })
    })

    describe.sequential("`x` is eventually-fulfilled", () => {
      let d = null

      function xFactory() {
        d = deferred()
        setTimeout(() => {
          d.resolve(sentinel)
        }, 50)
        return d.promise
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then((value) => {
          strictEqual(value, sentinel)
          done()
        })
      })
    })
  })

  describe("2.3.2.3: If/when `x` is rejected, reject `promise` with the same reason.", () => {
    describe.concurrent("`x` is already-rejected", () => {
      function xFactory() {
        return rejected(sentinel)
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then(null, (reason) => {
          strictEqual(reason, sentinel)
          done()
        })
      })
    })

    describe.sequential("`x` is eventually-rejected", () => {
      let d = null

      function xFactory() {
        d = deferred()
        setTimeout(() => {
          d.reject(sentinel)
        }, 50)
        return d.promise
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then(null, (reason) => {
          strictEqual(reason, sentinel)
          done()
        })
      })
    })
  })
})

function testPromiseResolution(xFactory, test) {
  it("via return from a fulfilled promise", async () => {
    await new Promise((done) => {
      const promise = resolved(dummy).then(() => {
        return xFactory()
      })

      test(promise, done)
    })
  })

  it("via return from a rejected promise", async () => {
    await new Promise((done) => {
      const promise = rejected(dummy).then(null, () => {
        return xFactory()
      })

      test(promise, done)
    })
  })
}
