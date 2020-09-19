import fs from "fs"
import chalk from "chalk"
import { Command } from "commander"
import {
    Config,
    Content,
    IFrontmatter,
    Notes,
    generateFrontmatter,
    parseArgs,
    saveNoteToDisk,
    printError,
    generateErrorMessage,
} from "../utils"
import { solicitNoteMetadata } from "."
const fsPromises = fs.promises

/**
 * NB: If a note is created interactively, options passed via flags are generally ignored, or used as a default
 * @param title
 * @param args
 */
export async function newNote(args: Command) {
    try {
        if (!args.title && !args.interactive)
            return console.log(
                chalk.bold.red(
                    "A new note needs a title (-t, --title). Alternatively, create the note in interactive mode(-i, --interactive)."
                )
            )

        const config = new Config()
        const configSettings = config.readConfig()
        const options = parseArgs(args)
        if (args.interactive) {
            await solicitNoteMetadata({ config: configSettings, options })
        }

        createFile(options)
        new Content().addNote(options)
    } catch (error) {
        printError(error, `Failed to create a new note`)
    }
}

async function createFile(options: IFrontmatter) {
    try {
        const notes = new Notes()
        const filePath = notes.generateFilePath(options)

        fsPromises
            .access(filePath)
            .then(() =>
                console.log(
                    chalk.red.bold(
                        `${filePath} already exists. Perhaps you meant to edit it instead?`
                    )
                )
            )
            .catch(() => {
                saveNoteToDisk({ filePath, body: generateFrontmatter(options) })
            })
    } catch (error) {
        throw new Error(
            generateErrorMessage(
                error,
                `Failed to create file, reason uncaught`
            )
        )
    }
}
