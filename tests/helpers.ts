import { test } from 'uvu'

import * as assert from 'uvu/assert'
import * as io from "../src/helpers/io"
import * as path from "path"
import { ResourceNotFound, NeanderthalError } from './../src/helpers/exceptions';

const SCRATCH = path.join(process.cwd(), "tests", "scratch")

function setup() {
    io.makeDir(SCRATCH)
}

function clean() {
    io.deleteDir(SCRATCH)
}

test('helpers/io.isDir()', () => {
    assert.type(io.isDir, 'function')
    assert.is(io.isDir(SCRATCH), true)

    const pathToFile = path.join(process.cwd(), ".gitignore")
    assert.is(io.isDir(pathToFile), false)

    const pathToMissing = path.join(process.cwd(), "non_existent_file.fake")
    assert.throws(() => {
        io.isDir(pathToMissing)
    })
})

test('helpers/io.isFile()', () => {
    const pathToFile = path.join(process.cwd(), ".gitignore")
    assert.is(io.isFile(pathToFile), true)

    assert.is(io.isFile(SCRATCH), false)
})


setup()
test.run()
// clean()


