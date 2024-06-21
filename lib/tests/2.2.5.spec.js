import { describe, it } from "vitest"
import { strictEqual } from "node:assert"
import { adapter } from "../adapter"

const resolved = adapter.resolved
const rejected = adapter.rejected

const dummy = { dummy: "dummy" } // we fulfill or reject with this when we don't intend to test against it

const global = this

describe("2.2.5 `onFulfilled` and `onRejected` must be called as functions (i.e. with no `this` value).", () => {
  describe.concurrent("strict mode", () => {
    it("fulfilled", async () => {
      await new Promise((done) => {
        resolved(dummy).then(function onFulfilled() {
          strictEqual(this, undefined)
          done()
        })
      })
    })

    it("rejected", async () => {
      await new Promise((done) => {
        rejected(dummy).then(null, function onRejected() {
          strictEqual(this, undefined)
          done()
        })
      })
    })
  })

  describe.skip.concurrent("sloppy mode", () => {
    it("fulfilled", async () => {
      await new Promise((done) => {
        resolved(dummy).then(function onFulfilled() {
          strictEqual(this, global)
          done()
        })
      })
    })

    it("rejected", async () => {
      await new Promise((done) => {
        rejected(dummy).then(null, function onRejected() {
          strictEqual(this, global)
          done()
        })
      })
    })
  })
})
