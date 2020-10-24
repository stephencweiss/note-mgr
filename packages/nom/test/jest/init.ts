import { test } from "@oclif/test"
const Init = require("../../src/commands/init")
const sinon = require("sinon")

// given when then
describe("Init command can receive an arg for a target directory", () => {
    test.stdout()
        .command(["init", "path"])
        .it("exits successfully", async (ctx) => {
            expect(ctx.stdout).toBe(
                "Successfully initialized nom at HOME/path!\nWelcome to a more pleasant life!\n"
            )
        })
})

describe("Init without an arg prompts for a target directory", () => {
    let promptStub: sinon.SinonStub = sinon
        .stub(Init.prototype, "solicitTarget")
        .callsFake(() => 100)

    // beforeEach(() => {
    //     const solicitTarget = Init.solicitTarget
    //     // console.log({ solicitTarget })
    //     promptStub = sinon.stub(Init, solicitTarget)
    // })

    // afterEach(() => {
    //     promptStub.restore()
    // })

    test.stdout()
        .command(["init"])
        .it("should prompt the user for an answer", async () => {
            expect(promptStub).toBeCalled()
        })
})

// describe("Init command", () => {
//     test.stdout()
//         .command(["init"])
//         .it("creates a notes directory if one does not exist", async (ctx) => {
//             await ctx
//             console.log(JSON.stringify(ctx, null, 4))
//             expect(ctx).toBeFalsy()
//         })
//     test.stdout()
//         .command(["init"])
//         .it(
//             "creates a `.contents` file within the notes directory",
//             (ctx) => {}
//         )
//     test.stdout()
//         .command(["init"])
//         .it("creates a default config file in the home directory", (ctx) => {})
// })
