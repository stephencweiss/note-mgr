import { Config } from "."
import fs from "fs"
import path from "path"

interface ContentRow {
    date: string
    private: boolean
    publish: string
    slug: string
    title: string
}

/**
 * The purpose of this file is to create a set of helpers for accessing the index file
 * for example, this will include things like
 * - add a new note
 * - organize the list of drafts
 * - organize the list of published notes
 * - delete a note
 * - publish a draft (i.e. move from drafts to publish)
 */
export class Content {
    private location = "" // the path to the indexFile e.g., if `nom` is configured to be in `$HOME/notes` the default would be `$HOME/notes/.contents.md`
    constructor() {}

    /**
     * Read the indexFile (default `.contents`)
     */
    async read() {
        const config = new Config()
        const root = await config.nomRootPath
        const indexFile = await config.indexFile
        if (!indexFile) {
            throw new Error(`Cannot read index if no indexFile is set. Have you initialized ?`)
        }
        const contents = fs.readFileSync(path.resolve(root, indexFile), { encoding: "utf8" }).split(`\n`)
        const headers = contents[0].split("|").map((header) => header.trim())
        console.log(headers)
    }

    /**
     * Retrieve the drafts from the index
     */
    async getDrafts() {}

    /**
     * Update the drafts
     */
    async updateDrafts() {}

    /**
     * Add a note to the indexFile
     * @param param0
     */
    async addNote({}: {}) {}

    /**
     * Publish a note moving it from the drafts section to the published section
     */
    async publishNote({}: {}) {}
}
