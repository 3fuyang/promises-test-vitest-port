#!/usr/bin/env node

import path from 'node:path'
import getMochaOpts from './getMochaOpts.js'
import programmaticRunner from './programmaticRunner.js'

const filePath = getAdapterFilePath()
const adapter = adapterObjectFromFilePath(filePath)
const mochaOpts = getMochaOpts(process.argv.slice(3))
programmaticRunner(adapter, mochaOpts, (err) => {
  if (err) {
    process.exit(err.failures || -1)
  }
})

function getAdapterFilePath() {
  if (process.argv[2]) {
    return path.join(process.cwd(), process.argv[2])
  } else {
    throw new Error('Specify your adapter file as an argument.')
  }
}

function adapterObjectFromFilePath(filePath) {
  try {
    return import(filePath)
  } catch (e) {
    const error = new Error(
      'Error `require`ing adapter file ' + filePath + '\n\n' + e
    )
    error.cause = e

    throw error
  }
}
