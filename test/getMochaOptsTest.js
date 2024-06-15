import assert from 'node:assert'
import getMochaOpts from '../lib/getMochaOpts.js'
import { describe, it } from 'mocha'

describe('getMochaOpts', () => {
  function test(argsString, expectedOpts) {
    var opts = getMochaOpts(argsString.split(' '))
    assert.deepEqual(opts, expectedOpts)
  }

  it('parses the provided options to an object', () => {
    test('--reporter spec --ui bdd', {
      reporter: 'spec',
      ui: 'bdd'
    })
  })

  it('sets the value for no-arg options to true', () => {
    test('--bail --ui bdd', {
      bail: true,
      ui: 'bdd'
    })
  })

  it('supports no-arg options as the last option', () => {
    test('--reporter spec --bail', {
      reporter: 'spec',
      bail: true
    })
  })
})
