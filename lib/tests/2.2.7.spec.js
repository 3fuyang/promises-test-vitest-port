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

describe("2.2.7: `then` must return a promise: `promise2 = promise1.then(onFulfilled, onRejected)`", function () {
  it("is a promise", function () {
    const promise1 = deferred().promise
    const promise2 = promise1.then()

    assert(typeof promise2 === "object" || typeof promise2 === "function")
    notStrictEqual(promise2, null)
    strictEqual(typeof promise2.then, "function")
  })

  describe(
    "2.2.7.1: If either `onFulfilled` or `onRejected` returns a value `x`, run the Promise Resolution " +
      "Procedure `[[Resolve]](promise2, x)`",
    function () {
      it("see separate 3.3 tests", function () {})
    },
  )

  describe(
    "2.2.7.2: If either `onFulfilled` or `onRejected` throws an exception `e`, `promise2` must be rejected " +
      "with `e` as the reason.",
    function () {
      function testReason(expectedReason, stringRepresentation) {
        describe("The reason is " + stringRepresentation, function () {
          testFulfilled(dummy, function (promise1, done) {
            const promise2 = promise1.then(function onFulfilled() {
              throw expectedReason
            })

            promise2.then(null, function onPromise2Rejected(actualReason) {
              strictEqual(actualReason, expectedReason)
              done()
            })
          })
          testRejected(dummy, function (promise1, done) {
            const promise2 = promise1.then(null, function onRejected() {
              throw expectedReason
            })

            promise2.then(null, function onPromise2Rejected(actualReason) {
              strictEqual(actualReason, expectedReason)
              done()
            })
          })
        })
      }

      Object.keys(reasons).forEach(function (stringRepresentation) {
        testReason(reasons[stringRepresentation](), stringRepresentation)
      })
    },
  )

  describe(
    "2.2.7.3: If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled " +
      "with the same value.",
    function () {
      function testNonFunction(nonFunction, stringRepresentation) {
        describe("`onFulfilled` is " + stringRepresentation, function () {
          testFulfilled(sentinel, function (promise1, done) {
            const promise2 = promise1.then(nonFunction)

            promise2.then(function onPromise2Fulfilled(value) {
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
      testNonFunction(
        [
          function () {
            return other
          },
        ],
        "an array containing a function",
      )
    },
  )

  describe(
    "2.2.7.4: If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected " +
      "with the same reason.",
    function () {
      function testNonFunction(nonFunction, stringRepresentation) {
        describe("`onRejected` is " + stringRepresentation, function () {
          testRejected(sentinel, function (promise1, done) {
            const promise2 = promise1.then(null, nonFunction)

            promise2.then(null, function onPromise2Rejected(reason) {
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
      testNonFunction(
        [
          function () {
            return other
          },
        ],
        "an array containing a function",
      )
    },
  )
})