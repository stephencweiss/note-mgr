import {
    Config,
    Content,
    FrontmatterKeys,
    findNote,
    removeNoteFile,
    parseOptions,
    Notes,
} from "../utils"

export async function removeNote() {
    try {
        const config = new Config().readConfig()
        const content = new Content()
        const notePath = await findNote(config)
        const frontmatter = parseOptions(
            new Notes().getFrontmatter(notePath),
            config
        )
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
