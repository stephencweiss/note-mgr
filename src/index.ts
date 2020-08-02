import { Command } from "commander"
import { init } from "./init"
import { newNote } from "./newNote"
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
        .command("new [note-title]")
        .alias("n")
        .option("-c --category <category...>", "The frontmatter for category")
        .option("-d --date <date>", "The frontmatter for publish")
        .option(
            "-f --file-extension <file-extension>",
            "The file type for the note"
        )
        .option("-i --interactive", "Interactively publish a note")
        .option("-p --publish <date>", "The frontmatter for publish")
        .option("-s --slug <slug>", "The frontmatter for the slug")
        .option("--title <title>", "The frontmatter for the title")
        .option("--custom [key:value...]", "Custom frontmatter")
        .option("--private", "The frontmatter for private", false)
        .option("-t --tags <tag...>", "The frontmatter for the title")
        .description("Creates a new draft note")
        .action((noteTitle, args) => {
            newNote(noteTitle, args)
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
        .option("-d --date <date>", "The frontmatter for publish")
        .option("-i --interactive", "Interactively publish a note")
        .option("-p --publish <date>", "The frontmatter for publish")
        .option("-t --title <title>", "The frontmatter for the title")
        .option("--custom [key:value...]", "Custom frontmatter")
        .option("--private", "The frontmatter for private", false)
        .option("--tags <tag...>", "The frontmatter for the title")
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
