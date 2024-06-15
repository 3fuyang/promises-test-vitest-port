import { strictEqual } from 'node:assert'
import { testRejected } from './helpers/testThreeCases.js'
import { describe, specify } from 'mocha'

const adapter = global.adapter
const deferred = adapter.deferred

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

describe('2.1.3.1: When rejected, a promise: must not transition to any other state.', () => {
  testRejected(dummy, (promise, done) => {
    let onRejectedCalled = false

    promise.then(
      function onFulfilled() {
        strictEqual(onRejectedCalled, false)
        done()
      },
      function onRejected() {
        onRejectedCalled = true
      }
    )

    setTimeout(done, 100)
  })

  specify('trying to reject then immediately fulfill', (done) => {
    const d = deferred()
    let onRejectedCalled = false

    d.promise.then(
      function onFulfilled() {
        strictEqual(onRejectedCalled, false)
        done()
      },
      function onRejected() {
        onRejectedCalled = true
      }
    )

    d.reject(dummy)
    d.resolve(dummy)
    setTimeout(done, 100)
  })

  specify('trying to reject then fulfill, delayed', (done) => {
    const d = deferred()
    let onRejectedCalled = false

    d.promise.then(
      function onFulfilled() {
        strictEqual(onRejectedCalled, false)
        done()
      },
      function onRejected() {
        onRejectedCalled = true
      }
    )

    setTimeout(() => {
      d.reject(dummy)
      d.resolve(dummy)
    }, 50)
    setTimeout(done, 100)
  })

  specify('trying to reject immediately then fulfill delayed', (done) => {
    const d = deferred()
    let onRejectedCalled = false

    d.promise.then(
      function onFulfilled() {
        strictEqual(onRejectedCalled, false)
        done()
      },
      function onRejected() {
        onRejectedCalled = true
      }
    )

    d.reject(dummy)
    setTimeout(() => {
      d.resolve(dummy)
    }, 50)
    setTimeout(done, 100)
  })
})
