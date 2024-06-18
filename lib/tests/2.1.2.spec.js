import { strictEqual } from "node:assert"
import { testFulfilled } from "./helpers/testThreeCases"
import { describe, it, expect } from "vitest"
import { adapter } from "../adapter"

const deferred = adapter.deferred

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it

describe.concurrent(
  "2.1.2.1: When fulfilled, a promise: must not transition to any other state.",
  () => {
    testFulfilled(dummy, (promise, done) => {
      let onFulfilledCalled = false

      promise.then(
        () => {
          onFulfilledCalled = true
        },
        () => {
          strictEqual(onFulfilledCalled, false)
          done()
        },
      )

      setTimeout(done, 100)
    })

    it("trying to fulfill then immediately reject", async () => {
      await new Promise((done) => {
        const d = deferred()
        let onFulfilledCalled = false

        d.promise.then(
          () => {
            onFulfilledCalled = true
          },
          () => {
            expect(onFulfilledCalled).toBe(false)
            done()
          },
        )

        d.resolve(dummy)
        d.reject(dummy)
        setTimeout(done, 100)
      })
    })

    it("trying to fulfill then reject, delayed", async () => {
      await new Promise((done) => {
        const d = deferred()
        let onFulfilledCalled = false

        d.promise.then(
          () => {
            onFulfilledCalled = true
          },
          () => {
            strictEqual(onFulfilledCalled, false)
            done()
          },
        )

        setTimeout(() => {
          d.resolve(dummy)
          d.reject(dummy)
        }, 50)
        setTimeout(done, 100)
      })
    })

    it("trying to fulfill immediately then reject delayed", async () => {
      await new Promise((done) => {
        const d = deferred()
        let onFulfilledCalled = false

        d.promise.then(
          () => {
            onFulfilledCalled = true
          },
          () => {
            strictEqual(onFulfilledCalled, false)
            done()
          },
        )

        d.resolve(dummy)
        setTimeout(() => {
          d.reject(dummy)
        }, 50)
        setTimeout(done, 100)
      })
    })
  },
)
