import { specify } from "mocha"

const adapter = global.adapter
const resolved = adapter.resolved
const rejected = adapter.rejected
const deferred = adapter.deferred

export const testFulfilled = function (value, test) {
  specify("already-fulfilled", function (done) {
    test(resolved(value), done)
  })

  specify("immediately-fulfilled", function (done) {
    const d = deferred()
    test(d.promise, done)
    d.resolve(value)
  })

  specify("eventually-fulfilled", function (done) {
    const d = deferred()
    test(d.promise, done)
    setTimeout(function () {
      d.resolve(value)
    }, 50)
  })
}

export const testRejected = function (reason, test) {
  specify("already-rejected", function (done) {
    test(rejected(reason), done)
  })

  specify("immediately-rejected", function (done) {
    const d = deferred()
    test(d.promise, done)
    d.reject(reason)
  })

  specify("eventually-rejected", function (done) {
    const d = deferred()
    test(d.promise, done)
    setTimeout(function () {
      d.reject(reason)
    }, 50)
  })
}
