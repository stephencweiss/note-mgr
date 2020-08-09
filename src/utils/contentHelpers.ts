import { Config } from "."
import fs from "fs"
import path from "path"
import { ConfigurationKeys } from "./config"

enum DocumentStages {
    DRAFT = "draft",
    READY_FOR_REVIEW = "ready_for_review",
    IN_REVIEW = "in_review",
    PUBLISHED = "published",
}

type ContentRow = Pick<
    Frontmatter,
    "date" | "private" | "publish" | "slug" | "stage" | "title"
>
type RowMap = Map<keyof ContentRow, any>

export enum FrontmatterKeys {
    Category = "Category",
    Date = "DateKey",
    PrivateKey = "PrivateKey",
    Publish = "Publish",
    Slug = "Slug",
    Tags = "Tags",
    Title = "Title",
}

export interface Frontmatter {
    title: string
    slug: string
    category: string[]
    tags: string[]
    date: string
    stage: DocumentStages
    publish: string
    private: boolean
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
    // private location = "" // the path to the indexFile e.g., if `nom` is configured to be in `$HOME/notes` the default would be `$HOME/notes/.contents.md`
    constructor() {}

    /**
     * Read the indexFile (default `.contents`)
     */
    read() {
        const config = new Config()
        const configOptions = config.readConfig()
        const root = configOptions.get(ConfigurationKeys.NOTES_ROOT_DIR)
        const indexFile = `${configOptions.get(
            ConfigurationKeys.NOTES_INDEX_FILE
        )}.md`
        const contentPath = path.resolve(root!, indexFile!)
        const contents = fs.readFileSync(contentPath, {
            encoding: "utf8",
        })
        const lines = contents.split(`\n`)
        const columns = lines[0].split("|").length
        const headers = this.splitLine(lines[0], columns)
        const divider = this.splitLine(lines[1], columns)

        const body = lines
            .slice(2)
            .map((line) => this.splitLine(line, columns))
            .filter((lines) => lines.length > 0)
            .reduce((acc, curLine) => {
                const frontmatter = curLine.reduce((acc, cur, i) => {
                    acc.set(headers[i], cur)
                    return acc
                }, new Map())
                acc.set(curLine[0], frontmatter)
                return acc
            }, new Map())

        return { headers, body }
    }

    private splitLine(line: string, columns: number) {
        return line
            .split("|")
            .slice(1, columns - 1)
            .map((el) => el.trim())
    }

    // /**
    //  * Add a note to the indexFile
    //  * @param param0
    //  */
    async addNote(noteFrontmatter: Map<FrontmatterKeys, any>) {
        // needs all of the
        // read the list
        // convert the frontmatter to the row
        // check that the frontmatter doesn't exist already
        // if it does, return an error
        // add the row to the list
        // write the list
    }

    private convertFrontmatterToRow(noteFrontmatter: ContentRow): RowMap {
        let row = new Map() as RowMap
        Object.keys(noteFrontmatter).forEach((key) => {
            row.set(
                key as keyof ContentRow,
                noteFrontmatter[key as keyof ContentRow]
            )
        })
        return row
    }
    // /**
    //  * Update a note
    //  */
    // async updateNote({}: {}) {}
}
