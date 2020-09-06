import path from "path"
import { Command } from "commander"
import inquirer from "inquirer"
import {
    Config,
    Content,
    FrontmatterKeys,
    ConfigurationKeys,
    DocumentStages,
} from "../utils"
import {
    generateFrontmatter,
    parseOptions,
    solicitNoteMetadata,
    testPath,
    readNote,
    findNote,
    saveNoteToDisk,
} from "."

inquirer.registerPrompt("fuzzypath", require("inquirer-fuzzy-path"))

export async function updateNote(args: Command) {
    const config = new Config().readConfig()
    const rootDir = config.get(ConfigurationKeys.NOTES_ROOT_DIR)!
    const fileExt = config.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION)!
    let notePath = path.resolve(rootDir, `${args.slug}.${fileExt}`)
    let frontmatter

    if (!(await testPath(notePath))) {
        notePath = await findNote(config, "update")
        // delete args.args // remove args since it was inaccurate
    }

    const note = readNote(notePath)
    const body = note.content
    const currentFrontmatter = note.data

    if (currentFrontmatter.publish && !currentFrontmatter.stage) {
        currentFrontmatter.stage = DocumentStages.Published
    }

    frontmatter = parseOptions(
        { ...currentFrontmatter, ...args },
        config
    ) as Map<FrontmatterKeys, any>

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
