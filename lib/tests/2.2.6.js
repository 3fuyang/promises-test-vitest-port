import { strictEqual } from 'assert'
import { stub, spy as _spy, assert as _assert, match } from 'sinon'
import { testFulfilled, testRejected } from './helpers/testThreeCases'
import { describe } from 'mocha'

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it
const other = { other: 'other' } // a value we don't want to be strict equal to
const sentinel = { sentinel: 'sentinel' } // a sentinel fulfillment value to test for with strict equality
const sentinel2 = { sentinel2: 'sentinel2' }
const sentinel3 = { sentinel3: 'sentinel3' }

function callbackAggregator(times, ultimateCallback) {
  let soFar = 0
  return function () {
    if (++soFar === times) {
      ultimateCallback()
    }
  }
}

describe('2.2.6: `then` may be called multiple times on the same promise.', function () {
  describe(
    '2.2.6.1: If/when `promise` is fulfilled, all respective `onFulfilled` callbacks must execute in the ' +
      'order of their originating calls to `then`.',
    function () {
      describe('multiple boring fulfillment handlers', function () {
        testFulfilled(sentinel, function (promise, done) {
          const handler1 = stub().returns(other)
          const handler2 = stub().returns(other)
          const handler3 = stub().returns(other)

          const spy = _spy()
          promise.then(handler1, spy)
          promise.then(handler2, spy)
          promise.then(handler3, spy)

          promise.then(function (value) {
            strictEqual(value, sentinel)

            _assert.calledWith(handler1, match.same(sentinel))
            _assert.calledWith(handler2, match.same(sentinel))
            _assert.calledWith(handler3, match.same(sentinel))
            _assert.notCalled(spy)

            done()
          })
        })
      })

      describe('multiple fulfillment handlers, one of which throws', function () {
        testFulfilled(sentinel, function (promise, done) {
          const handler1 = stub().returns(other)
          const handler2 = stub().throws(other)
          const handler3 = stub().returns(other)

          const spy = _spy()
          promise.then(handler1, spy)
          promise.then(handler2, spy)
          promise.then(handler3, spy)

          promise.then(function (value) {
            strictEqual(value, sentinel)

            _assert.calledWith(handler1, match.same(sentinel))
            _assert.calledWith(handler2, match.same(sentinel))
            _assert.calledWith(handler3, match.same(sentinel))
            _assert.notCalled(spy)

            done()
          })
        })
      })

      describe('results in multiple branching chains with their own fulfillment values', function () {
        testFulfilled(dummy, function (promise, done) {
          const semiDone = callbackAggregator(3, done)

          promise
            .then(function () {
              return sentinel
            })
            .then(function (value) {
              strictEqual(value, sentinel)
              semiDone()
            })

          promise
            .then(function () {
              throw sentinel2
            })
            .then(null, function (reason) {
              strictEqual(reason, sentinel2)
              semiDone()
            })

          promise
            .then(function () {
              return sentinel3
            })
            .then(function (value) {
              strictEqual(value, sentinel3)
              semiDone()
            })
        })
      })

      describe('`onFulfilled` handlers are called in the original order', function () {
        testFulfilled(dummy, function (promise, done) {
          const handler1 = _spy(function handler1() {})
          const handler2 = _spy(function handler2() {})
          const handler3 = _spy(function handler3() {})

          promise.then(handler1)
          promise.then(handler2)
          promise.then(handler3)

          promise.then(function () {
            _assert.callOrder(handler1, handler2, handler3)
            done()
          })
        })

        describe('even when one handler is added inside another handler', function () {
          testFulfilled(dummy, function (promise, done) {
            const handler1 = _spy(function handler1() {})
            const handler2 = _spy(function handler2() {})
            const handler3 = _spy(function handler3() {})

            promise.then(function () {
              handler1()
              promise.then(handler3)
            })
            promise.then(handler2)

            promise.then(function () {
              // Give implementations a bit of extra time to flush their internal queue, if necessary.
              setTimeout(function () {
                _assert.callOrder(handler1, handler2, handler3)
                done()
              }, 15)
            })
          })
        })
      })
    }
  )

  describe(
    '2.2.6.2: If/when `promise` is rejected, all respective `onRejected` callbacks must execute in the ' +
      'order of their originating calls to `then`.',
    function () {
      describe('multiple boring rejection handlers', function () {
        testRejected(sentinel, function (promise, done) {
          const handler1 = stub().returns(other)
          const handler2 = stub().returns(other)
          const handler3 = stub().returns(other)

          const spy = _spy()
          promise.then(spy, handler1)
          promise.then(spy, handler2)
          promise.then(spy, handler3)

          promise.then(null, function (reason) {
            strictEqual(reason, sentinel)

            _assert.calledWith(handler1, match.same(sentinel))
            _assert.calledWith(handler2, match.same(sentinel))
            _assert.calledWith(handler3, match.same(sentinel))
            _assert.notCalled(spy)

            done()
          })
        })
      })

      describe('multiple rejection handlers, one of which throws', function () {
        testRejected(sentinel, function (promise, done) {
          const handler1 = stub().returns(other)
          const handler2 = stub().throws(other)
          const handler3 = stub().returns(other)

          const spy = _spy()
          promise.then(spy, handler1)
          promise.then(spy, handler2)
          promise.then(spy, handler3)

          promise.then(null, function (reason) {
            strictEqual(reason, sentinel)

            _assert.calledWith(handler1, match.same(sentinel))
            _assert.calledWith(handler2, match.same(sentinel))
            _assert.calledWith(handler3, match.same(sentinel))
            _assert.notCalled(spy)

            done()
          })
        })
      })

      describe('results in multiple branching chains with their own fulfillment values', function () {
        testRejected(sentinel, function (promise, done) {
          const semiDone = callbackAggregator(3, done)

          promise
            .then(null, function () {
              return sentinel
            })
            .then(function (value) {
              strictEqual(value, sentinel)
              semiDone()
            })

          promise
            .then(null, function () {
              throw sentinel2
            })
            .then(null, function (reason) {
              strictEqual(reason, sentinel2)
              semiDone()
            })

          promise
            .then(null, function () {
              return sentinel3
            })
            .then(function (value) {
              strictEqual(value, sentinel3)
              semiDone()
            })
        })
      })

      describe('`onRejected` handlers are called in the original order', function () {
        testRejected(dummy, function (promise, done) {
          const handler1 = _spy(function handler1() {})
          const handler2 = _spy(function handler2() {})
          const handler3 = _spy(function handler3() {})

          promise.then(null, handler1)
          promise.then(null, handler2)
          promise.then(null, handler3)

          promise.then(null, function () {
            _assert.callOrder(handler1, handler2, handler3)
            done()
          })
        })

        describe('even when one handler is added inside another handler', function () {
          testRejected(dummy, function (promise, done) {
            const handler1 = _spy(function handler1() {})
            const handler2 = _spy(function handler2() {})
            const handler3 = _spy(function handler3() {})

            promise.then(null, function () {
              handler1()
              promise.then(null, handler3)
            })
            promise.then(null, handler2)

            promise.then(null, function () {
              // Give implementations a bit of extra time to flush their internal queue, if necessary.
              setTimeout(function () {
                _assert.callOrder(handler1, handler2, handler3)
                done()
              }, 15)
            })
          })
        })
      })
    }
  )
})
