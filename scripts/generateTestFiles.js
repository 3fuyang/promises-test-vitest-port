import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const testsDir = path.resolve(__dirname, '../lib/tests')
const testDirFiles = fs.readdirSync(testsDir)

const outFileWritableStream = fs.createWriteStream(
  path.resolve(__dirname, '../lib/testFiles.js'),
  { encoding: 'utf-8' }
)

// outFile.write('"use strict";\n')

testDirFiles.forEach((file) => {
  if (path.extname(file) !== '.js') {
    return
  }

  outFileWritableStream.write('await import("./')
  outFileWritableStream.write('tests/' + path.basename(file))
  outFileWritableStream.write('");\n')
})

outFileWritableStream.end((err) => {
  if (err) {
    throw err
  }
})
