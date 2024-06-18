import assert, { notStrictEqual, strictEqual } from "node:assert"
import { testFulfilled } from "./helpers/testThreeCases"
import { testRejected } from "./helpers/testThreeCases"
import reasons from "./helpers/reasons"
import { describe, it } from "vitest"
import { adapter } from "../adapter"

const deferred = adapter.deferred

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it
const sentinel = { sentinel: "sentinel" } // a sentinel fulfillment value to test for with strict equality
const other = { other: "other" } // a value we don't want to be strict equal to

describe("2.2.7: `then` must return a promise: `promise2 = promise1.then(onFulfilled, onRejected)`", () => {
  it("is a promise", () => {
    const promise1 = deferred().promise
    const promise2 = promise1.then()

    assert(typeof promise2 === "object" || typeof promise2 === "function")
    notStrictEqual(promise2, null)
    strictEqual(typeof promise2.then, "function")
  })

  describe(
    "2.2.7.1: If either `onFulfilled` or `onRejected` returns a value `x`, run the Promise Resolution " +
      "Procedure `[[Resolve]](promise2, x)`",
    () => {
      it("see separate 3.3 tests", () => {})
    },
  )

  describe(
    "2.2.7.2: If either `onFulfilled` or `onRejected` throws an exception `e`, `promise2` must be rejected " +
      "with `e` as the reason.",
    () => {
      function testReason(expectedReason, stringRepresentation) {
        describe.concurrent("The reason is " + stringRepresentation, () => {
          testFulfilled(dummy, (promise1, done) => {
            const promise2 = promise1.then(() => {
              throw expectedReason
            })

            promise2.then(null, (actualReason) => {
              strictEqual(actualReason, expectedReason)
              done()
            })
          })
          testRejected(dummy, (promise1, done) => {
            const promise2 = promise1.then(null, () => {
              throw expectedReason
            })

            promise2.then(null, (actualReason) => {
              strictEqual(actualReason, expectedReason)
              done()
            })
          })
        })
      }

      Object.keys(reasons).forEach((stringRepresentation) => {
        testReason(reasons[stringRepresentation](), stringRepresentation)
      })
    },
  )

  describe.concurrent(
    "2.2.7.3: If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled " +
      "with the same value.",
    () => {
      function testNonFunction(nonFunction, stringRepresentation) {
        describe("`onFulfilled` is " + stringRepresentation, () => {
          testFulfilled(sentinel, (promise1, done) => {
            const promise2 = promise1.then(nonFunction)

            promise2.then((value) => {
              strictEqual(value, sentinel)
              done()
            })
          })
        })
      }

      testNonFunction(undefined, "`undefined`")
      testNonFunction(null, "`null`")
      testNonFunction(false, "`false`")
      testNonFunction(5, "`5`")
      testNonFunction({}, "an object")
      testNonFunction([() => other], "an array containing a function")
    },
  )

  describe.concurrent(
    "2.2.7.4: If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected " +
      "with the same reason.",
    () => {
      function testNonFunction(nonFunction, stringRepresentation) {
        describe("`onRejected` is " + stringRepresentation, () => {
          testRejected(sentinel, (promise1, done) => {
            const promise2 = promise1.then(null, nonFunction)

            promise2.then(null, (reason) => {
              strictEqual(reason, sentinel)
              done()
            })
          })
        })
      }

      testNonFunction(undefined, "`undefined`")
      testNonFunction(null, "`null`")
      testNonFunction(false, "`false`")
      testNonFunction(5, "`5`")
      testNonFunction({}, "an object")
      testNonFunction([() => other], "an array containing a function")
    },
  )
})
