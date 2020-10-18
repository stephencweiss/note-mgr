import { Volume } from "memfs"

// jest will mock any import of the fs module
jest.mock("fs", () => {
    const fs = jest.requireActual("fs")
    const unionfs = require("unionfs").default
    return unionfs.use(fs)
})

beforeEach(() => {
    jest.resetAllMocks()
})

// fs.promises

// fs.readFileSync(fileName)

test("calling fs returns a mocked call", async () => {
    const vol = Volume.fromJSON({ "/foo": "bar" })
    const fsMocked = require("fs")
    const fs = fsMocked.use(vol) // tell the mocked fs (via Jest) to use vol as its file system.
    const val = fs.readFileSync("/foo", { encoding: "utf8" })
    const os = require("os")
    const HOME = os.homedir()
    fs.promises
        .readdir(HOME)
        .then((files: any) => files.find((file: any) => file === ".zshrc"))
        .then((file: any) =>
            fs.promises
                .access(`${HOME}/${file}`)
                .then(() => true)
                .catch(() => false)
        )
        .then((res: boolean) => expect(res).toBe(true))
    expect(val).toBe("bar")
})
