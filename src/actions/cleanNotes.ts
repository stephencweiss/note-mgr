import fs from "fs"
import {
    Config,
    Content,
    ConfigurationKeys,
    Notes,
    IFrontmatter,
} from "../utils"
const fsPromises = fs.promises

export async function cleanNotes() {
    /**
     * first step
     * collect all notes
     * collect all lines of .contents
     */
    const content = new Content()
    const { headers, divider, body: contentBody } = content.readContent()
    const notes = new Notes()
    const allNotesFrontmatter = await notes.allNotesFrontmatter()
    // console.log({ contentBody })
    /**
     * first pass
     * compare notes to lines of .contents
     * If not present, _add_ to .contents
     */
    const newNotes = allNotesFrontmatter.filter((frontmatter: IFrontmatter) => {
        console.log(`first:`, frontmatter)
        const rowTitle = notes.generateRowTitle(frontmatter)
        return !contentBody.has(rowTitle)
    })
    content.addNotes(newNotes, headers, divider, contentBody)

    /**
     * second pass
     * compare lines of .contents to all notes
     * if not present, _remove_ from .contents
     */

    //

    // console.log({ contentBody })

    // const config = new Config().readConfig()
    // const rootDir = config.get(ConfigurationKeys.NOTES_ROOT_DIR)!
    // const fileExt = config.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION)!
    // const dir = await fsPromises.readdir(rootDir)

    // dir.filter((file) => file.charAt(0) !== ".").map((file) => {
    //     const path = `${rootDir}/${file}`
    //     const frontmatter = parseArgs(readNote(path).data, config)
    //     // convert frontmatter to Map

    //     if (contentBody.has(file)) {
    //         console.log(`has ${file}`)
    //     } else {
    //         console.log(`does not have ${file}`)
    //     }
    // })
    // for every note
    // if it exists in the body, update it
    // if it doesn't, dismiss it.

    // new Content().addNote(options as Map<FrontmatterKeys, string>)
}
