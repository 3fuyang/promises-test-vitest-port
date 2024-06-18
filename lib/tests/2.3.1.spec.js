import { describe, it } from "vitest"
import assert from "node:assert"
import { adapter } from "../adapter"

const resolved = adapter.resolved
const rejected = adapter.rejected

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it

describe.concurrent("2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason.", () => {
  it("via return from a fulfilled promise", async () => {
    await new Promise((done) => {
      const promise = resolved(dummy).then(() => promise)

      promise.then(null, (reason) => {
        assert(reason instanceof TypeError)
        done()
      })
    })
  })

  it("via return from a rejected promise", async () => {
    await new Promise((done) => {
      const promise = rejected(dummy).then(null, () => promise)

      promise.then(null, (reason) => {
        assert(reason instanceof TypeError)
        done()
      })
    })
  })
})
