
import * as fs from "fs-extra"
import * as path from "path"
import { ResourceNotFound } from "./exceptions"

export const ioStats = {
    writes: 0,
    reads: 0
}

export function isDir(dir) {
    return fs.lstatSync(dir).isDirectory()
}

export function makeDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
}

export function deleteDir(dir) {
    fs.removeSync(dir)
}

export function writeFile(filepath, content) {
    return new Promise((resolve, reject) => {
        let dir = path.parse(filepath).dir
        makeDir(dir)
        fs.writeFile(filepath, content, (err) => {
            if (err) {
                reject(err)
            }
            resolve("saved")
            ioStats.writes++
        })
    })

}

export function readFile(filepath, callback) {
    fs.readFile(filepath, "utf8", (err, result) => {
        if (err) {
            console.error(err)
        }
        callback(result)
        ioStats.reads++
    })
}

export function readFileIfExists(filepath): Promise<string> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filepath)) {
            fs.lstat(filepath).then(stats => {
                if (stats.isFile()) {
                    fs.readFile(filepath, "utf8", (err, result) => {
                        if (err) {
                            reject(false)
                        }
                        resolve(result)
                        ioStats.reads++
                    })
                }
            }).catch(err => {
                reject(err)

            })
        } else {
            reject(new ResourceNotFound(filepath))
        }

    })
}

export function isFile(filepath) {
    return fs.existsSync(filepath) && fs.lstatSync(filepath).isFile()
}