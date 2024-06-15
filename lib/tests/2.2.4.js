'use strict'

import { strictEqual } from 'node:assert'
import { testFulfilled, testRejected } from './helpers/testThreeCases.js'
import { describe, specify } from 'mocha'

const adapter = global.adapter
const resolved = adapter.resolved
const rejected = adapter.rejected
const deferred = adapter.deferred

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

describe(
  '2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only ' +
    'platform code.',
  function () {
    describe('`then` returns before the promise becomes fulfilled or rejected', function () {
      testFulfilled(dummy, function (promise, done) {
        let thenHasReturned = false

        promise.then(function onFulfilled() {
          strictEqual(thenHasReturned, true)
          done()
        })

        thenHasReturned = true
      })
      testRejected(dummy, function (promise, done) {
        let thenHasReturned = false

        promise.then(null, function onRejected() {
          strictEqual(thenHasReturned, true)
          done()
        })

        thenHasReturned = true
      })
    })

    describe('Clean-stack execution ordering tests (fulfillment case)', function () {
      specify(
        'when `onFulfilled` is added immediately before the promise is fulfilled',
        function () {
          const d = deferred()
          let onFulfilledCalled = false

          d.promise.then(function onFulfilled() {
            onFulfilledCalled = true
          })

          d.resolve(dummy)

          strictEqual(onFulfilledCalled, false)
        }
      )

      specify(
        'when `onFulfilled` is added immediately after the promise is fulfilled',
        function () {
          const d = deferred()
          let onFulfilledCalled = false

          d.resolve(dummy)

          d.promise.then(function onFulfilled() {
            onFulfilledCalled = true
          })

          strictEqual(onFulfilledCalled, false)
        }
      )

      specify(
        'when one `onFulfilled` is added inside another `onFulfilled`',
        function (done) {
          const promise = resolved()
          let firstOnFulfilledFinished = false

          promise.then(function () {
            promise.then(function () {
              strictEqual(firstOnFulfilledFinished, true)
              done()
            })
            firstOnFulfilledFinished = true
          })
        }
      )

      specify(
        'when `onFulfilled` is added inside an `onRejected`',
        function (done) {
          const promise = rejected()
          const promise2 = resolved()
          let firstOnRejectedFinished = false

          promise.then(null, function () {
            promise2.then(function () {
              strictEqual(firstOnRejectedFinished, true)
              done()
            })
            firstOnRejectedFinished = true
          })
        }
      )

      specify('when the promise is fulfilled asynchronously', function (done) {
        const d = deferred()
        let firstStackFinished = false

        setTimeout(function () {
          d.resolve(dummy)
          firstStackFinished = true
        }, 0)

        d.promise.then(function () {
          strictEqual(firstStackFinished, true)
          done()
        })
      })
    })

    describe('Clean-stack execution ordering tests (rejection case)', function () {
      specify(
        'when `onRejected` is added immediately before the promise is rejected',
        function () {
          const d = deferred()
          let onRejectedCalled = false

          d.promise.then(null, function onRejected() {
            onRejectedCalled = true
          })

          d.reject(dummy)

          strictEqual(onRejectedCalled, false)
        }
      )

      specify(
        'when `onRejected` is added immediately after the promise is rejected',
        function () {
          const d = deferred()
          let onRejectedCalled = false

          d.reject(dummy)

          d.promise.then(null, function onRejected() {
            onRejectedCalled = true
          })

          strictEqual(onRejectedCalled, false)
        }
      )

      specify(
        'when `onRejected` is added inside an `onFulfilled`',
        function (done) {
          const promise = resolved()
          const promise2 = rejected()
          let firstOnFulfilledFinished = false

          promise.then(function () {
            promise2.then(null, function () {
              strictEqual(firstOnFulfilledFinished, true)
              done()
            })
            firstOnFulfilledFinished = true
          })
        }
      )

      specify(
        'when one `onRejected` is added inside another `onRejected`',
        function (done) {
          const promise = rejected()
          let firstOnRejectedFinished = false

          promise.then(null, function () {
            promise.then(null, function () {
              strictEqual(firstOnRejectedFinished, true)
              done()
            })
            firstOnRejectedFinished = true
          })
        }
      )

      specify('when the promise is rejected asynchronously', function (done) {
        const d = deferred()
        let firstStackFinished = false

        setTimeout(function () {
          d.reject(dummy)
          firstStackFinished = true
        }, 0)

        d.promise.then(null, function () {
          strictEqual(firstStackFinished, true)
          done()
        })
      })
    })
  }
)
