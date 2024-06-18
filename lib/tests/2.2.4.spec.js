import { strictEqual } from "node:assert"
import { testFulfilled, testRejected } from "./helpers/testThreeCases.js"
import { describe, it } from "vitest"
import { adapter } from "../adapter.js"

const resolved = adapter.resolved
const rejected = adapter.rejected
const deferred = adapter.deferred

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it

describe(
  "2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only " +
    "platform code.",
  () => {
    describe.concurrent(
      "`then` returns before the promise becomes fulfilled or rejected",
      () => {
        testFulfilled(dummy, (promise, done) => {
          let thenHasReturned = false

          promise.then(function onFulfilled() {
            strictEqual(thenHasReturned, true)
            done()
          })

          thenHasReturned = true
        })
        testRejected(dummy, (promise, done) => {
          let thenHasReturned = false

          promise.then(null, function onRejected() {
            strictEqual(thenHasReturned, true)
            done()
          })

          thenHasReturned = true
        })
      },
    )

    describe.concurrent(
      "Clean-stack execution ordering tests (fulfillment case)",
      () => {
        it("when `onFulfilled` is added immediately before the promise is fulfilled", () => {
          const d = deferred()
          let onFulfilledCalled = false

          d.promise.then(function onFulfilled() {
            onFulfilledCalled = true
          })

          d.resolve(dummy)

          strictEqual(onFulfilledCalled, false)
        })

        it("when `onFulfilled` is added immediately after the promise is fulfilled", () => {
          const d = deferred()
          let onFulfilledCalled = false

          d.resolve(dummy)

          d.promise.then(function onFulfilled() {
            onFulfilledCalled = true
          })

          strictEqual(onFulfilledCalled, false)
        })

        it("when one `onFulfilled` is added inside another `onFulfilled`", async () => {
          await new Promise((done) => {
            const promise = resolved()
            let firstOnFulfilledFinished = false

            promise.then(() => {
              promise.then(() => {
                strictEqual(firstOnFulfilledFinished, true)
                done()
              })
              firstOnFulfilledFinished = true
            })
          })
        })

        it("when `onFulfilled` is added inside an `onRejected`", async () => {
          await new Promise((done) => {
            const promise = rejected()
            const promise2 = resolved()
            let firstOnRejectedFinished = false

            promise.then(null, () => {
              promise2.then(() => {
                strictEqual(firstOnRejectedFinished, true)
                done()
              })
              firstOnRejectedFinished = true
            })
          })
        })

        it("when the promise is fulfilled asynchronously", async () => {
          await new Promise((done) => {
            const d = deferred()
            let firstStackFinished = false

            setTimeout(() => {
              d.resolve(dummy)
              firstStackFinished = true
            }, 0)

            d.promise.then(() => {
              strictEqual(firstStackFinished, true)
              done()
            })
          })
        })
      },
    )

    describe.concurrent(
      "Clean-stack execution ordering tests (rejection case)",
      () => {
        it("when `onRejected` is added immediately before the promise is rejected", () => {
          const d = deferred()
          let onRejectedCalled = false

          d.promise.then(null, function onRejected() {
            onRejectedCalled = true
          })

          d.reject(dummy)

          strictEqual(onRejectedCalled, false)
        })

        it("when `onRejected` is added immediately after the promise is rejected", () => {
          const d = deferred()
          let onRejectedCalled = false

          d.reject(dummy)

          d.promise.then(null, function onRejected() {
            onRejectedCalled = true
          })

          strictEqual(onRejectedCalled, false)
        })

        it("when `onRejected` is added inside an `onFulfilled`", async () => {
          await new Promise((done) => {
            const promise = resolved()
            const promise2 = rejected()
            let firstOnFulfilledFinished = false

            promise.then(() => {
              promise2.then(null, () => {
                  strictEqual(firstOnFulfilledFinished, true)
                  done()
                })
              firstOnFulfilledFinished = true
            })
          })
        })

        it("when one `onRejected` is added inside another `onRejected`", async () => {
          await new Promise((done) => {
            const promise = rejected()
            let firstOnRejectedFinished = false

            promise.then(null, () => {
              promise.then(null, () => {
                strictEqual(firstOnRejectedFinished, true)
                done()
              })
              firstOnRejectedFinished = true
            })
          })
        })

        it("when the promise is rejected asynchronously", async () => {
          await new Promise((done) => {
            const d = deferred()
            let firstStackFinished = false

            setTimeout(() => {
              d.reject(dummy)
              firstStackFinished = true
            }, 0)

            d.promise.then(null, () => {
              strictEqual(firstStackFinished, true)
              done()
            })
          })
        })
      },
    )
  },
)
