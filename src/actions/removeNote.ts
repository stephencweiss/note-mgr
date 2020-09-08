import { findNote, readNote, removeNoteFile } from "../utils/noteHelpers"
import { Config, Content, FrontmatterKeys } from "../utils"

export async function removeNote() {
    try {
        const config = new Config().readConfig()
        const content = new Content()
        const notePath = await findNote(config)
        const note = readNote(notePath)
        const frontmatter = note.data
        await removeNoteFile(notePath)
        content.removeRow(
            frontmatter.title as FrontmatterKeys.title,
            frontmatter.slug as FrontmatterKeys.slug
        )
        console.log(`Successfully deleted the note ${frontmatter.title}`)
    } catch (e) {
        console.log(`Failed to delete the note\n${e}`)
    }
}
