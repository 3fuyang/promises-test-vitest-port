import { strictEqual } from 'node:assert'
import { testFulfilled } from './helpers/testThreeCases'
import { describe, it } from 'vitest'
import { adapter } from '../adapter'

const deferred = adapter.deferred

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

describe('2.1.2.1: When fulfilled, a promise: must not transition to any other state.', () => {
  testFulfilled(dummy, function (promise, done) {
    let onFulfilledCalled = false

    promise.then(
      function onFulfilled() {
        onFulfilledCalled = true
      },
      function onRejected() {
        strictEqual(onFulfilledCalled, false)
        done()
      }
    )

    setTimeout(done, 100)
  })

  it('trying to fulfill then immediately reject', (done) => {
    const d = deferred()
    let onFulfilledCalled = false

    d.promise.then(
      function onFulfilled() {
        onFulfilledCalled = true
      },
      function onRejected() {
        strictEqual(onFulfilledCalled, false)
        done()
      }
    )

    d.resolve(dummy)
    d.reject(dummy)
    setTimeout(done, 100)
  })

  it('trying to fulfill then reject, delayed', (done) => {
    const d = deferred()
    let onFulfilledCalled = false

    d.promise.then(
      function onFulfilled() {
        onFulfilledCalled = true
      },
      function onRejected() {
        strictEqual(onFulfilledCalled, false)
        done()
      }
    )

    setTimeout(function () {
      d.resolve(dummy)
      d.reject(dummy)
    }, 50)
    setTimeout(done, 100)
  })

  it('trying to fulfill immediately then reject delayed', (done) => {
    const d = deferred()
    let onFulfilledCalled = false

    d.promise.then(
      function onFulfilled() {
        onFulfilledCalled = true
      },
      function onRejected() {
        strictEqual(onFulfilledCalled, false)
        done()
      }
    )

    d.resolve(dummy)
    setTimeout(() => {
      d.reject(dummy)
    }, 50)
    setTimeout(done, 100)
  })
})
