// This module exports some valid rejection reason factories, keyed by human-readable versions of their names.

import { adapter } from "../../adapter"

const resolved = adapter.resolved
const rejected = adapter.rejected

const dummy = { dummy: "dummy" }

const exports = {}

exports["`undefined`"] = () => undefined

exports["`null`"] = () => null

exports["`false`"] = () => false

exports["`0`"] = () => 0

exports["an error"] = () => new Error()

exports["an error without a stack"] = () => {
  const error = new Error()
  delete error.stack

  return error
}

exports["a date"] = () => new Date()

exports["an object"] = () => ({})

exports["an always-pending thenable"] = () => ({ then: function () {} })

exports["a fulfilled promise"] = () => resolved(dummy)

exports["a rejected promise"] = () => rejected(dummy)

export default exports
