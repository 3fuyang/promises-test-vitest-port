// This module exports some valid rejection reason factories, keyed by human-readable versions of their names.

import { adapter } from "../../adapter"

const resolved = adapter.resolved
const rejected = adapter.rejected

const dummy = { dummy: "dummy" }

const reasons = {}

reasons["`undefined`"] = () => undefined

reasons["`null`"] = () => null

reasons["`false`"] = () => false

reasons["`0`"] = () => 0

reasons["an error"] = () => new Error()

reasons["an error without a stack"] = () => {
  const error = new Error()
  delete error.stack

  return error
}

reasons["a date"] = () => new Date()

reasons["an object"] = () => ({})

reasons["an always-pending thenable"] = () => ({ then: () => {} })

reasons["a fulfilled promise"] = () => resolved(dummy)

const rejectedPromise = rejected(dummy)
// avoid uncaught rejection error
rejectedPromise.then(
  () => {},
  () => {},
)

reasons["a rejected promise"] = () => rejectedPromise

export default reasons
