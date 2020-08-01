import { Command } from "commander"
import { init } from "./init"
import dotenv from "dotenv"

dotenv.config()

function main() {
    const program = new Command()
    program.version("0.0.1", "-v --version", "Current Version")

    program
        .command("init")
        .alias("i")
        .description("Initialize nom, the hungry note manager")
        .option(
            "-t --target-dir <directoryPath>",
            "The relative path to the target directory for notes"
        )
        .action(init)
    program
        .command("create-draft <note-title>")
        .alias("c")
        .description("Creates a new draft note")
        .action((noteTitle) => {
            console.log(`Add draft creation here for ${noteTitle}`)
            createDraft(noteTitle)
        })
    program
        .command("last-published")
        .alias("l")
        .description("Finds the date of the most recently published note")
        .action(() => {
            console.log(`Add last published here`)
        })
    program
        .command("publish <note-title>")
        .alias("p")
        .description("Publish a note")
        .option("-c --category <category>", "The frontmatter for category")
        .option("-p --publish <date>", "The frontmatter for publish")
        .option("-t --title <title>", "The frontmatter for the title")
        .option("--tags <tag...>", "The frontmatter for the title")
        .option("-i --interactive", "Interactively publish a note")
        .action((noteTitle, args) => {
            const { category, publish, title, tags } = args
            console.log(
                `publish the given note: ${noteTitle} with args: ${category}, ${publish}, ${title}, ${tags}`
            )
        })

    program.parse(process.argv)
}

// * Handle local development with `npm start` or `yarn start`
if (process.argv[3] === "start") main()

export default main
