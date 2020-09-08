import path from "path"
import { Command } from "commander"
import inquirer from "inquirer"
import {
    Config,
    Content,
    FrontmatterKeys,
    ConfigurationKeys,
    DocumentStages,
    generateFrontmatter,
    Notes,
    parseOptions,
    testPath,
    findNote,
    saveNoteToDisk,
} from "../utils"
import { solicitNoteMetadata } from "."

inquirer.registerPrompt("fuzzypath", require("inquirer-fuzzy-path"))

export async function updateNote(args: Command) {
    const config = new Config().readConfig()
    const rootDir = config.get(ConfigurationKeys.NOTES_ROOT_DIR)!
    const fileExt = config.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION)!
    let filePath = path.resolve(rootDir, `${args.slug}.${fileExt}`)
    let frontmatter

    if (!(await testPath(filePath))) {
        filePath = await findNote(config)
    }

    const note = new Notes().readNote(filePath)
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
        filePath: filePath,
        body: `${generateFrontmatter(frontmatter)}${body}`,
    })

    const content = new Content()
    content.updateNote({ frontmatter, filePath })
}
