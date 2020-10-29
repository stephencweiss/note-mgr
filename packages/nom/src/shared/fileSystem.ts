const fs = require("fs")

type FSOptions = {
    encoding?: string
    mode?: string | number
    flag?: string
}

/**
 * FS provides a wrapper around accessing a file system
 */
function deleteFile(path: string) {
    return fs.promises.unlink(path)
}
function deleteFileSync(path: string) {
    return fs.unlinkSync(path)
}
function fileExists(path: string) {
    return fs.promises.access(path)
}
function fileExistsSync(path: string) {
    return fs.accessSync(path)
}
function makeFolder(path: string, options?: { recursive?: boolean }) {
    return fs.promises.mkdir(path, options)
}
function makeFolderSync(path: string, options?: { recursive?: boolean }) {
    return fs.mkdirSync(path, options)
}
function readFile(path: string, options?: FSOptions) {
    return fs.promises.readFile(path, { encoding: "utf8", ...options })
}
function readFileSync(path: string, options?: FSOptions) {
    return fs.readFileSync(path, { encoding: "utf8", ...options })
}
function saveFile(path: string, content: string) {
    return fs.promises.writeFile(path, content)
}
function saveFileSync(path: string, content: string, options?: FSOptions) {
    return fs.writeFileSync(path, content, { encoding: "utf8", ...options })
}

module.exports = {
    deleteFile,
    deleteFileSync,
    fileExists,
    fileExistsSync,
    makeFolder,
    makeFolderSync,
    readFile,
    readFileSync,
    saveFile,
    saveFileSync,
}
