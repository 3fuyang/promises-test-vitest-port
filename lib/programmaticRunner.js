import Mocha from 'mocha'
import path from 'node:path'
import fs from 'node:fs'
import _ from 'underscore'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const testsDir = path.resolve(__dirname, 'tests')

function normalizeAdapter(adapter) {
  if (!adapter.resolved) {
    adapter.resolved = (value) => {
      const d = adapter.deferred()
      d.resolve(value)
      return d.promise
    }
  }

  if (!adapter.rejected) {
    adapter.rejected = (reason) => {
      const d = adapter.deferred()
      d.reject(reason)
      return d.promise
    }
  }
}

export default function runner(adapter, mochaOpts, cb) {
  if (typeof mochaOpts === 'function') {
    cb = mochaOpts
    mochaOpts = {}
  }
  if (typeof cb !== 'function') {
    cb = () => {}
  }

  normalizeAdapter(adapter)
  mochaOpts = _.defaults(mochaOpts, { timeout: 200, slow: Infinity })

  fs.readdir(testsDir, (err, testFileNames) => {
    if (err) {
      cb(err)
      return
    }

    const mocha = new Mocha(mochaOpts)
    testFileNames.forEach((testFileName) => {
      if (path.extname(testFileName) === '.js') {
        const testFilePath = path.resolve(testsDir, testFileName)
        mocha.addFile(testFilePath)
      }
    })

    global.adapter = adapter
    mocha.run((failures) => {
      delete global.adapter
      if (failures > 0) {
        const err = new Error('Test suite failed with ' + failures + ' failures.')
        err.failures = failures
        cb(err)
      } else {
        cb(null)
      }
    })
  })
}

export const mocha = async (adapter) => {
  normalizeAdapter(adapter)

  global.adapter = adapter

  await import('./testFiles')

  delete global.adapter
}
