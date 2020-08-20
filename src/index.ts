import { Command } from "commander"
import dotenv from "dotenv"
dotenv.config()

import { init } from "./init"
import { dates } from "./dates"
import { counters } from "./counts"
import { newNote } from "./notes"

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
        .option("-s --slug <slug>", "The frontmatter for the slug (kebab-case)")
        .option("--title <title>", "The frontmatter for the title")
        .option("--custom [key:value...]", "Custom frontmatter")
        .option("--private", "The frontmatter for private", false)
        .option("-t --tags <tag...>", "The frontmatter for the title")
        .description("Creates a new draft note")
        .action(newNote)
    program
        .command("date")
        .alias("d")
        .option(
            "-i --interactive",
            "Interactively select the style of date published"
        )
        .option("-f --first", "Return the earliest published note")
        .option("-l --latest", "(Default) Return the latest published note")
        .option(
            "-r --recent",
            "Return the most recent published note in the past"
        )
        .description("Interrogate notes by their date fields")
        .action(dates)
    program
        .command("count")
        .alias("c")
        .option("-d --date", "Return the count of notes listed by date")
        .option(
            "-p --publish",
            "(Default) Return the count of notes listed by publish date"
        )
        .option("-s --stage", "Return the count of notes based on stage")
        .option("-c --category", "Return the count of notes based on stage")
        // .option("--filter", "filter out specific keys")
        .option("-t --tags", "Return the count of notes based on stage")
        .action(counters)
    program
        .command("publish [note-title]")
        .alias("p")
        .description("Publish a note")
        .option("-c --category <category>", "The frontmatter for category")
        .option("-d --date <date>", "The frontmatter for publish")
        .option("-i --interactive", "Interactively publish a note")
        .option(
            "-p --publish <date>",
            "The frontmatter for publish, default today"
        )
        .option("-s --slug <slug>", "The frontmatter for the slug (kebab-case)")
        .option("-t --title <title>", "The frontmatter for the title")
        .option("--custom [key:value...]", "Custom frontmatter")
        .option("--private", "The frontmatter for private", false)
        .option("--tags <tag...>", "The frontmatter for the tags")
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
