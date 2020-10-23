import path from "path"
import { Command } from "commander"
import inquirer from "inquirer"
import {
    Config,
    Content,
    ConfigurationKeys,
    DocumentStages,
    generateFrontmatter,
    generateFrontmatterObj,
    Notes,
    saveNoteToDisk,
    IFrontmatter,
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
    const currentFrontmatter = note.data as IFrontmatter

    if (currentFrontmatter.publish && !currentFrontmatter.stage) {
        currentFrontmatter.stage = DocumentStages.Published
    }

    let argFrontmatter = Object.fromEntries(
        Object.entries(generateFrontmatterObj(args)).filter(([_, value]) =>
            Array.isArray(value) ? value.length : Boolean(value)
        )
    ) as Partial<IFrontmatter> // Note: this only works because frontmatter has only strings and arrays; if an object were added, this would break
    frontmatter = { ...currentFrontmatter, ...argFrontmatter } as IFrontmatter

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
