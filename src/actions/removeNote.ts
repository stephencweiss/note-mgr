import { Content, FrontmatterKeys, Notes } from "../utils"

export async function removeNote() {
    try {
        const content = new Content()
        const notes = new Notes()
        const filePath = await notes.find()
        const relativeFilePath = await notes.getRelativeFilePath(filePath)
        const frontmatter = notes.getFrontmatter(filePath)
        const contentTitle = notes.generateRowTitle(
            frontmatter,
            relativeFilePath
        )

        // Check that both note and .content exists
        if (!(await notes.testPath(filePath))) {
            console.log(`fails here`)
            throw new Error(`Could not find ${filePath}`)
        }

        if (!content.testRowTitle(contentTitle)) {
            throw new Error(`Could not find ${filePath} in .contents`)
        }

        // Remove both note and .content
        await notes.remove(filePath)
        content.removeRow(contentTitle)

        console.log(`Successfully deleted the note ${frontmatter["title"]}`)
    } catch (e) {
        console.log(`Failed to delete the note\n${e}`)
    }
}
