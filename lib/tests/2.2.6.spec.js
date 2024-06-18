import { strictEqual } from "node:assert"
import { testFulfilled, testRejected } from "./helpers/testThreeCases"
import { describe, vi, expect } from "vitest"

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it
const other = { other: "other" } // a value we don't want to be strict equal to
const sentinel = { sentinel: "sentinel" } // a sentinel fulfillment value to test for with strict equality
const sentinel2 = { sentinel2: "sentinel2" }
const sentinel3 = { sentinel3: "sentinel3" }

function callbackAggregator(times, ultimateCallback) {
  let soFar = 0
  return () => {
    if (++soFar === times) {
      ultimateCallback()
    }
  }
}

describe("2.2.6: `then` may be called multiple times on the same promise.", () => {
  describe(
    "2.2.6.1: If/when `promise` is fulfilled, all respective `onFulfilled` callbacks must execute in the " +
      "order of their originating calls to `then`.",
    () => {
      describe.concurrent("multiple boring fulfillment handlers", () => {
        testFulfilled(sentinel, (promise, done) => {
          const handler1 = vi.fn(() => other)
          const handler2 = vi.fn(() => other)
          const handler3 = vi.fn(() => other)

          const spy = vi.fn()
          promise.then(handler1, spy)
          promise.then(handler2, spy)
          promise.then(handler3, spy)

          promise.then((value) => {
            strictEqual(value, sentinel)

            expect(handler1).toBeCalledWith(sentinel)
            expect(handler2).toBeCalledWith(sentinel)
            expect(handler3).toBeCalledWith(sentinel)
            expect(spy).not.toBeCalled()

            done()
          })
        })
      })

      describe.concurrent("multiple fulfillment handlers, one of which throws", () => {
        testFulfilled(sentinel, (promise, done) => {
          const handler1 = vi.fn(() => other)
          const handler2 = vi.fn(() => {
            throw other
          })
          const handler3 = vi.fn(() => other)

          const spy = vi.fn()
          promise.then(handler1, spy)
          promise.then(handler2, spy).then(null, () => {})
          promise.then(handler3, spy)

          promise.then((value) => {
            strictEqual(value, sentinel)

            expect(handler1).toBeCalledWith(sentinel)
            expect(handler2).toBeCalledWith(sentinel)
            expect(handler3).toBeCalledWith(sentinel)
            expect(spy).not.toBeCalled()

            done()
          })
        })
      })

      describe.concurrent("results in multiple branching chains with their own fulfillment values", () => {
        testFulfilled(dummy, (promise, done) => {
          const semiDone = callbackAggregator(3, done)

          promise
            .then(() => sentinel)
            .then((value) => {
              strictEqual(value, sentinel)
              semiDone()
            })

          promise
            .then(() => {
              throw sentinel2
            })
            .then(null, (reason) => {
              strictEqual(reason, sentinel2)
              semiDone()
            })

          promise
            .then(() => {
              return sentinel3
            })
            .then((value) => {
              strictEqual(value, sentinel3)
              semiDone()
            })
        })
      })

      describe.concurrent("`onFulfilled` handlers are called in the original order", () => {
        testFulfilled(dummy, (promise, done) => {
          const called = []
          const handler1 = vi.fn(() => {
            called.push(1)
          })
          const handler2 = vi.fn(() => {
            called.push(2)
          })
          const handler3 = vi.fn(() => {
            called.push(3)
          })

          promise.then(handler1)
          promise.then(handler2)
          promise.then(handler3)

          promise.then(() => {
            expect(called).toEqual([1, 2, 3])
            done()
          })
        })

        describe.concurrent("even when one handler is added inside another handler", function () {
          testFulfilled(dummy, (promise, done) => {
            const called = []
            const handler1 = vi.fn(() => {
              called.push(1)
            })
            const handler2 = vi.fn(() => {
              called.push(2)
            })
            const handler3 = vi.fn(() => {
              called.push(3)
            })

            handler1()
            promise.then(() => {
              promise.then(handler3)
            })
            promise.then(handler2)

            promise.then(() => {
              // Give implementations a bit of extra time to flush their internal queue, if necessary.
              setTimeout(() => {
                expect(called).toEqual([1, 2, 3])
                done()
              }, 15)
            })
          })
        })
      })
    },
  )

  describe(
    "2.2.6.2: If/when `promise` is rejected, all respective `onRejected` callbacks must execute in the " +
      "order of their originating calls to `then`.",
    () => {
      describe.concurrent("multiple boring rejection handlers", () => {
        testRejected(sentinel, (promise, done) => {
          const handler1 = vi.fn(() => other)
          const handler2 = vi.fn(() => other)
          const handler3 = vi.fn(() => other)

          const spy = vi.fn()
          promise.then(spy, handler1)
          promise.then(spy, handler2)
          promise.then(spy, handler3)

          promise.then(null, (reason) => {
            strictEqual(reason, sentinel)

            expect(handler1).toBeCalledWith(sentinel)
            expect(handler2).toBeCalledWith(sentinel)
            expect(handler3).toBeCalledWith(sentinel)
            expect(spy).not.toBeCalled()

            done()
          })
        })
      })

      describe.concurrent("multiple rejection handlers, one of which throws", () => {
        testRejected(sentinel, (promise, done) => {
          const handler1 = vi.fn(() => other)
          const handler2 = vi.fn(() => {
            throw other
          })
          const handler3 = vi.fn(() => other)

          const spy = vi.fn()
          promise.then(spy, handler1)
          promise.then(spy, handler2).then(null, () => {})
          promise.then(spy, handler3)

          promise.then(null, (reason) => {
            strictEqual(reason, sentinel)

            expect(handler1).toBeCalledWith(sentinel)
            expect(handler2).toBeCalledWith(sentinel)
            expect(handler3).toBeCalledWith(sentinel)
            expect(spy).not.toBeCalled()

            done()
          })
        })
      })

      describe.concurrent("results in multiple branching chains with their own fulfillment values", () => {
        testRejected(sentinel, (promise, done) => {
          const semiDone = callbackAggregator(3, done)

          promise
            .then(null, () => sentinel)
            .then((value) => {
              strictEqual(value, sentinel)
              semiDone()
            })

          promise
            .then(null, () => {
              throw sentinel2
            })
            .then(null, (reason) => {
              strictEqual(reason, sentinel2)
              semiDone()
            })

          promise
            .then(null, () => sentinel3)
            .then((value) => {
              strictEqual(value, sentinel3)
              semiDone()
            })
        })
      })

      describe.concurrent("`onRejected` handlers are called in the original order", () => {
        testRejected(dummy, (promise, done) => {
          const called = []
          const handler1 = vi.fn(() => {
            called.push(1)
          })
          const handler2 = vi.fn(() => {
            called.push(2)
          })
          const handler3 = vi.fn(() => {
            called.push(3)
          })

          promise.then(null, handler1)
          promise.then(null, handler2)
          promise.then(null, handler3)

          promise.then(null, () => {
            expect(called).toEqual([1, 2, 3])
            done()
          })
        })

        describe.concurrent("even when one handler is added inside another handler", () => {
          testRejected(dummy, (promise, done) => {
            const called = []
            const handler1 = vi.fn(() => {
              called.push(1)
            })
            const handler2 = vi.fn(() => {
              called.push(2)
            })
            const handler3 = vi.fn(() => {
              called.push(3)
            })

            promise.then(null, () => {
              handler1()
              promise.then(null, handler3)
            })
            promise.then(null, handler2)

            promise.then(null, () => {
              // Give implementations a bit of extra time to flush their internal queue, if necessary.
              setTimeout(() => {
                expect(called).toEqual([1, 2, 3])
                done()
              }, 15)
            })
          })
        })
      })
    },
  )
})
