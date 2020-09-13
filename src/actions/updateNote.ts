import path from "path"
import { Command } from "commander"
import inquirer from "inquirer"
import {
    Config,
    Content,
    ConfigurationKeys,
    DocumentStages,
    generateFrontmatter,
    Notes,
    saveNoteToDisk,
    Frontmatter,
} from "../utils"
import { solicitNoteMetadata } from "."

inquirer.registerPrompt("fuzzypath", require("inquirer-fuzzy-path"))

export async function updateNote(args: Command) {
    const config = new Config().readConfig()
    const rootDir = config.get(ConfigurationKeys.NOTES_ROOT_DIR)!
    const fileExt = config.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION)!
    let filePath = path.resolve(rootDir, `${args.slug}.${fileExt}`)
    let frontmatter
    const notes = new Notes()
    if (!(await notes.testPath(filePath))) {
        filePath = await notes.find()
    }

    const note = notes.read(filePath)
    const body = note.content
    const currentFrontmatter = note.data as Frontmatter

    if (currentFrontmatter.publish && !currentFrontmatter.stage) {
        currentFrontmatter.stage = DocumentStages.Published
    }

    frontmatter = { ...currentFrontmatter, ...args } as Frontmatter

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
