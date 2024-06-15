import { it } from "vitest"
import { adapter } from "../../adapter"

const resolved = adapter.resolved
const rejected = adapter.rejected
const deferred = adapter.deferred

export const testFulfilled = function (value, test) {
  it("already-fulfilled", function (done) {
    test(resolved(value), done)
  })

  it("immediately-fulfilled", function (done) {
    const d = deferred()
    test(d.promise, done)
    d.resolve(value)
  })

  it("eventually-fulfilled", function (done) {
    const d = deferred()
    test(d.promise, done)
    setTimeout(function () {
      d.resolve(value)
    }, 50)
  })
}

export const testRejected = function (reason, test) {
  it("already-rejected", function (done) {
    test(rejected(reason), done)
  })

  it("immediately-rejected", function (done) {
    const d = deferred()
    test(d.promise, done)
    d.reject(reason)
  })

  it("eventually-rejected", function (done) {
    const d = deferred()
    test(d.promise, done)
    setTimeout(function () {
      d.reject(reason)
    }, 50)
  })
}
