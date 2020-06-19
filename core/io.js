
const fs = require("fs-extra")
const path = require("path")

exports.isDir = function (dir) {
    return fs.lstatSync(dir).isDirectory()
}

exports.makeDir = function (dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

exports.deleteDir = function (dir) {
    fs.removeSync(dir)
}

exports.writeFile = function (filepath, content) {
    return new Promise((resolve, reject) => {
        let dir = path.parse(filepath).dir
        exports.makeDir(dir)
        fs.writeFile(filepath, content, (err) => {
            if (err) {
                reject(err)
            }
            resolve()
        })
    })

}

exports.readFile = function (filepath, callback) {
    fs.readFile(filepath, "utf8", (err, result) => {
        if (err) {
            console.error(err)
            throw new Error(err)
        }
        callback(result)
    })
}
