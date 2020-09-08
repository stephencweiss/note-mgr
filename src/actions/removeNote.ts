import {
    Config,
    Content,
    FrontmatterKeys,
    findNote,
    readNote,
    removeNoteFile,
    parseOptions,
} from "../utils"

export async function removeNote() {
    try {
        const config = new Config().readConfig()
        const content = new Content()
        const notePath = await findNote(config)
        const note = readNote(notePath)
        const frontmatter = parseOptions(note.data, config)
        await removeNoteFile(notePath)
        content.removeRow(frontmatter)
        console.log(
            `Successfully deleted the note ${frontmatter.get(
                FrontmatterKeys.title
            )}`
        )
    } catch (e) {
        console.log(`Failed to delete the note\n${e}`)
    }
}
