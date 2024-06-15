import { it } from "vitest"
import { adapter } from "../../adapter"

const resolved = adapter.resolved
const rejected = adapter.rejected
const deferred = adapter.deferred

export const testFulfilled = (value, predicate) => {
  it("already-fulfilled", async () => {
    await new Promise((done) => {
      predicate(resolved(value), done)
    })
  })

  it("immediately-fulfilled", async () => {
    await new Promise((done) => {
      const d = deferred()
      predicate(d.promise, done)
      d.resolve(value)
    })
  })

  it("eventually-fulfilled", async () => {
    await new Promise((done) => {
      const d = deferred()
      predicate(d.promise, done)
      setTimeout(() => {
        d.resolve(value)
      }, 50)
    })
  })
}

export const testRejected = function (reason, predicate) {
  it("already-rejected", async () => {
    await new Promise((done) => {
      predicate(rejected(reason), done)
    })
  })

  it("immediately-rejected", async () => {
    await new Promise((done) => {
      const d = deferred()
      predicate(d.promise, done)
      d.reject(reason)
    })
  })

  it("eventually-rejected", async () => {
    await new Promise((done) => {
      const d = deferred()
      predicate(d.promise, done)
      setTimeout(() => {
        d.reject(reason)
      }, 50)
    })
  })
}
