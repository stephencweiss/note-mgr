import { test } from "@oclif/test"
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
// given when then
describe("Init command", () => {
    test.stdout()
        .command(["init"])
        .it("creates a notes directory if one does not exist", (ctx) => {})
    test.stdout()
        .command(["init"])
        .it(
            "creates a `.contents` file within the notes directory",
            (ctx) => {}
        )
    test.stdout()
        .command(["init"])
        .it("creates a default config file in the home directory", (ctx) => {})
})

describe("init command works ok", () => {
    test.stdout()
        .command(["init"]) // the command
        .it("runs init", (ctx) => {
            expect(ctx.stdout).toBe("hello world from ./src/commands/init.ts\n")
        })

    test.stdout()
        .command(["init", "--name", "jeff"])
        .it("runs init --name jeff", (ctx) => {
            expect(ctx.stdout).toBe("hello jeff from ./src/commands/init.ts\n")
        })
})
