import { test } from "@oclif/test"

// given when then
describe("Init command can receive an arg for a target directory", () => {
    test.stdout()
        .command(["init", "path"])
        .it("exits successfully", async (ctx) => {
            expect(ctx.stdout).toBe(
                "Successfully initialized nom! Welcome to a more pleasant life!\n"
            )
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
