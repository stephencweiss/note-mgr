import { Command } from "commander"
import dotenv from "dotenv"
dotenv.config()

import { init } from "./init"
import { dates } from "./dates"
import { counters } from "./counts"
import { newNote, removeNote, updateNote } from "./actions"

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
        .command("new")
        .alias("n")
        .option("-c --category <category...>", "The frontmatter for category")
        .option("-d --date <date>", "The frontmatter for publish")
        .option("-i --interactive", "Interactively publish a note")
        .option("-p --publish <date>", "The frontmatter for publish")
        .option("-s --slug <slug>", "The frontmatter for the slug (kebab-case)")
        .option("-t --title <title>", "The frontmatter for the title")
        .option("--private", "The frontmatter for private", false)
        .option("--tag <tag...>", "The frontmatter for the title")
        .description("Creates a new draft note")
        .action(newNote)
    program
        .command("update")
        .alias("u")
        .description("Update a note's frontmatter")
        .option("-c --category <category>", "The frontmatter for category")
        .option("-i --interactive", "Interactively publish a note")
        .option("-d --date <date>", "The frontmatter for publish")
        .option(
            "-p --publish <date>",
            "The frontmatter for publish, default today"
        )
        .option("-s --slug <slug>", "The frontmatter for the slug (kebab-case)")
        .option("--stage <stage>", "The frontmatter for the stage")
        .option("-t --title <title>", "The frontmatter for the title")
        .option("--private", "Make the note private", false)
        .option("--tag <tag...>", "The frontmatter for the tags")
        .action(updateNote)
    program
        .command("remove")
        .alias("r")
        .description("Remove a note")
        .action(removeNote)
    program
        .command("date [noteCount]")
        .alias("d")
        .option(
            "-f --first",
            "Date style: Return dates sorted in ascending order based on publish date (earliest -> latest)"
        )
        .option(
            "-l --latest",
            "(Default) Date style: Return dates sorted in descending order based on publish date (latest -> earliest)"
        )
        .option(
            "-r --recent",
            "Date style: Return dates sorted in descending order based on publish date (latest -> earliest). Only shows dates before TODAY"
        )
        .option(
            "-m --multipleDates",
            "Show all dates for a given style, overrides note count",
            false
        )
        .description("Interrogate notes by their date fields")
        .action((count, cmd) => dates(cmd, count))
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
        .option("-p --private", "Only consider notes that are private") //TODO: Need to implement per https://github.com/stephencweiss/note-mgr/issues/23
        .option("-np --no-private", "Only consider notes that are not private") //TODO: Need to implement per https://github.com/stephencweiss/note-mgr/issues/23
        .option("-t --tags", "Return the count of notes based on stage")
        .action(counters)

    program.parse(process.argv)
}

// * Handle local development with `npm start` or `yarn start`
if (process.argv[3] === "start") main()

export default main
