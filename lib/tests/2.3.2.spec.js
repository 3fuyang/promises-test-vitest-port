import { strictEqual } from "node:assert"
import { describe, it } from "vitest"
import { adapter } from "../adapter"

const resolved = adapter.resolved
const rejected = adapter.rejected
const deferred = adapter.deferred

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it
const sentinel = { sentinel: "sentinel" } // a sentinel fulfillment value to test for with strict equality

function testPromiseResolution(xFactory, test) {
  it("via return from a fulfilled promise", function (done) {
    const promise = resolved(dummy).then(function onBasePromiseFulfilled() {
      return xFactory()
    })

    test(promise, done)
  })

  it("via return from a rejected promise", function (done) {
    const promise = rejected(dummy).then(
      null,
      function onBasePromiseRejected() {
        return xFactory()
      },
    )

    test(promise, done)
  })
}

describe("2.3.2: If `x` is a promise, adopt its state", function () {
  describe("2.3.2.1: If `x` is pending, `promise` must remain pending until `x` is fulfilled or rejected.", function () {
    function xFactory() {
      return deferred().promise
    }

    testPromiseResolution(xFactory, function (promise, done) {
      let wasFulfilled = false
      let wasRejected = false

      promise.then(
        function onPromiseFulfilled() {
          wasFulfilled = true
        },
        function onPromiseRejected() {
          wasRejected = true
        },
      )

      setTimeout(function () {
        strictEqual(wasFulfilled, false)
        strictEqual(wasRejected, false)
        done()
      }, 100)
    })
  })

  describe("2.3.2.2: If/when `x` is fulfilled, fulfill `promise` with the same value.", function () {
    describe("`x` is already-fulfilled", function () {
      function xFactory() {
        return resolved(sentinel)
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(function onPromiseFulfilled(value) {
          strictEqual(value, sentinel)
          done()
        })
      })
    })

    describe("`x` is eventually-fulfilled", function () {
      let d = null

      function xFactory() {
        d = deferred()
        setTimeout(function () {
          d.resolve(sentinel)
        }, 50)
        return d.promise
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(function onPromiseFulfilled(value) {
          strictEqual(value, sentinel)
          done()
        })
      })
    })
  })

  describe("2.3.2.3: If/when `x` is rejected, reject `promise` with the same reason.", function () {
    describe("`x` is already-rejected", function () {
      function xFactory() {
        return rejected(sentinel)
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(null, function onPromiseRejected(reason) {
          strictEqual(reason, sentinel)
          done()
        })
      })
    })

    describe("`x` is eventually-rejected", function () {
      let d = null

      function xFactory() {
        d = deferred()
        setTimeout(function () {
          d.reject(sentinel)
        }, 50)
        return d.promise
      }

      testPromiseResolution(xFactory, function (promise, done) {
        promise.then(null, function onPromiseRejected(reason) {
          strictEqual(reason, sentinel)
          done()
        })
      })
    })
  })
})
