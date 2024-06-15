import { strictEqual } from "node:assert"
import { testFulfilled, testRejected } from "./helpers/testThreeCases.js"
import { afterEach, beforeEach, it } from "vitest"

var dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it

it("2.3.4: If `x` is not an object or function, fulfill `promise` with `x`", function () {
  function testValue(
    expectedValue,
    stringRepresentation,
    beforeEachHook,
    afterEachHook,
  ) {
    it("The value is " + stringRepresentation, function () {
      if (typeof beforeEachHook === "function") {
        beforeEach(beforeEachHook)
      }
      if (typeof afterEachHook === "function") {
        afterEach(afterEachHook)
      }

      testFulfilled(dummy, function (promise1, done) {
        var promise2 = promise1.then(function onFulfilled() {
          return expectedValue
        })

        promise2.then(function onPromise2Fulfilled(actualValue) {
          strictEqual(actualValue, expectedValue)
          done()
        })
      })
      testRejected(dummy, function (promise1, done) {
        var promise2 = promise1.then(null, function onRejected() {
          return expectedValue
        })

        promise2.then(function onPromise2Fulfilled(actualValue) {
          strictEqual(actualValue, expectedValue)
          done()
        })
      })
    })
  }

  testValue(undefined, "`undefined`")
  testValue(null, "`null`")
  testValue(false, "`false`")
  testValue(true, "`true`")
  testValue(0, "`0`")

  testValue(
    true,
    "`true` with `Boolean.prototype` modified to have a `then` method",
    function () {
      Boolean.prototype.then = function () {}
    },
    function () {
      delete Boolean.prototype.then
    },
  )

  testValue(
    1,
    "`1` with `Number.prototype` modified to have a `then` method",
    function () {
      Number.prototype.then = function () {}
    },
    function () {
      delete Number.prototype.then
    },
  )
})