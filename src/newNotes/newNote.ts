import fs from "fs"
import chalk from "chalk"
import kebabCase from "lodash.kebabcase"
import { Config, Content, FrontmatterKeys } from "../utils"
import { Command } from "commander"
require("dotenv").config()
import {
    generateFilePath,
    generateFrontmatter,
    parseOptions,
    solicitOptions,
    updateOptions,
} from "."
const fsPromises = fs.promises

/**
 * Making a few assumptions at this time:
 * 1. If a note is created interactively, options passed via flags are generally ignored
 * 2. The slug is _always_ auto-generated based on the title
 * @param title
 * @param args
 */
export async function newNote(title: string | undefined, args: Command) {
    if (!title && !args.title && !args.interactive)
        return console.log(
            chalk.bold.red(
                "A new notes needs a title unless generated interactively (`-i`)."
            )
        )

    const config = new Config()
    const configSettings = config.readConfig()
    const options = parseOptions(args, configSettings)
    if (args.interactive) {
        await solicitOptions(title, configSettings, options)
    }

    updateOptions(
        options,
        FrontmatterKeys.Slug,
        kebabCase(options.get(FrontmatterKeys.Title))
    )

    console.log({ options })
    createFile(config, options)
    new Content().addNote(options)
    console.log(`Note added!`)
    // todo: add it to `.notes`
}

async function createFile(config: Config, options: Map<any, any>) {
    const filePath = generateFilePath(config, options)

    // const noteIndex = config.get(ConfigurationKeys.NOTES_INDEX_FILE) // don't need this here, need it in the function that adds to the indexFile
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
            fs.writeFile(
                filePath,
                generateFrontmatter(options),
                (error: Error | null) => {
                    if (error)
                        throw new Error(
                            `Failed to create ${filePath} at path.\n${error.message}`
                        )
                }
            )
        })
}
