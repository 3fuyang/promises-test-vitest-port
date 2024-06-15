import { describe, it } from "vitest"
import assert from "node:assert"
import { adapter } from "../adapter"

var resolved = adapter.resolved
var rejected = adapter.rejected

var dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it

describe("2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason.", function () {
  it("via return from a fulfilled promise", function (done) {
    var promise = resolved(dummy).then(function () {
      return promise
    })

    promise.then(null, function (reason) {
      assert(reason instanceof TypeError)
      done()
    })
  })

  it("via return from a rejected promise", function (done) {
    var promise = rejected(dummy).then(null, function () {
      return promise
    })

    promise.then(null, function (reason) {
      assert(reason instanceof TypeError)
      done()
    })
  })
})
