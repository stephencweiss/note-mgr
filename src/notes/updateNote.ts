import fs from "fs"
import path from "path"
import chalk from "chalk"
import matter from "gray-matter"
import kebabCase from "lodash.kebabcase"
import { Command } from "commander"
import inquirer, { prompt } from "inquirer"
import {
    Config,
    Content,
    FrontmatterKeys,
    ConfigurationKeys,
    DocumentStages,
} from "../utils"
import {
    generateFilePath,
    generateFrontmatter,
    parseOptions,
    solicitNoteMetadata,
    updateOptions,
    saveNoteToDisk,
} from "."

const fsPromises = fs.promises

inquirer.registerPrompt("fuzzypath", require("inquirer-fuzzy-path"))

export async function updateNote(args: Command) {
    const config = new Config().readConfig()
    const rootDir = config.get(ConfigurationKeys.NOTES_ROOT_DIR)!
    const fileExt = config.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION)!
    let notePath = path.resolve(rootDir, `${args.slug}.${fileExt}`)
    let frontmatter

    if (!(await testPath(notePath))) {
        notePath = await findNote(config)
        // delete args.args // remove args since it was inaccurate
    }

    const note = matter(fs.readFileSync(notePath, { encoding: "utf8" }))
    const body = note.content
    const currentFrontmatter = note.data

    if (currentFrontmatter.publish && !currentFrontmatter.stage) {
        currentFrontmatter.stage = DocumentStages.Published
    }

    frontmatter = parseOptions({ ...currentFrontmatter, ...args }, config, {
        current: currentFrontmatter,
    }) as Map<FrontmatterKeys, any>

    if (args.interactive) {
        await solicitNoteMetadata({ config, options: frontmatter })
    }

    saveNoteToDisk({
        filePath: notePath,
        body: `${generateFrontmatter(frontmatter)}${body}`,
    })

    const content = new Content()
    content.updateNote({ frontmatter })
}

async function testPath(notePath: string) {
    return await fsPromises
        .access(notePath)
        .then(() => true)
        .catch(() => false)
}

async function findNote(config: Map<ConfigurationKeys, string>) {
    const rootDir = config.get(ConfigurationKeys.NOTES_ROOT_DIR)!
    const questions = [
        {
            type: "fuzzypath",
            name: "filePath",
            excludePath: (nodePath: string) =>
                nodePath.startsWith("node_modules"),
            excludeFilter: (nodePath: string) => nodePath.startsWith("."),
            itemType: "file",
            rootPath: rootDir,
            message: "Select the note you'd like to update:",
            default: "",
            suggestOnly: false,
            depthLimit: 0,
        },
    ]

    return await prompt(questions).then((answers) => answers.filePath as string)
}
