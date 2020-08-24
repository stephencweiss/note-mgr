import fs from "fs"
import chalk from "chalk"
import { Command } from "commander"
import { Config, Content } from "../utils"

import {
    generateFilePath,
    generateFrontmatter,
    parseOptions,
    solicitNoteMetadata,
    saveNoteToDisk,
} from "."
const fsPromises = fs.promises

/**
 * NB: If a note is created interactively, options passed via flags are generally ignored, or used as a default
 * @param title
 * @param args
 */
export async function newNote(args: Command) {
    if (!args.title && !args.interactive)
        return console.log(
            chalk.bold.red(
                "A new note needs a title (-t, --title). Alternatively, create the note in interactive mode(-i, --interactive)."
            )
        )

    const config = new Config()
    const configSettings = config.readConfig()
    const options = parseOptions(args, configSettings)
    if (args.interactive) {
        await solicitNoteMetadata({ config: configSettings, options })
    }

    createFile(config, options)
    new Content().addNote(options)
}

async function createFile(config: Config, options: Map<any, any>) {
    const filePath = generateFilePath(config, options)

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
}
