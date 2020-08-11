import chalk from "chalk"
import fs from "fs"
import path from "path"
import { Config, ConfigurationKeys } from "."

export enum DocumentStages {
    Draft = "draft",
    Ready_For_Review = "ready_for_review",
    In_Review = "in_review",
    Published = "published",
}

export type ContentHeaders =
    | "date"
    | "private"
    | "publish"
    | "slug"
    | "stage"
    | "title"

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
    Stage = "Stage",
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
export class Content extends Config {
    // private location = "" // the path to the indexFile e.g., if `nom` is configured to be in `$HOME/notes` the default would be `$HOME/notes/.contents.md`
    contentPath = ""
    constructor() {
        super()
        const configOptions = this.readConfig()
        const root = configOptions.get(ConfigurationKeys.NOTES_ROOT_DIR)
        const indexFile = `${configOptions.get(
            ConfigurationKeys.NOTES_INDEX_FILE
        )}.md`
        this.contentPath = path.resolve(root!, indexFile!)
    }

    /**
     * Read the indexFile (default `.contents`)
     */
    read() {
        const contents = fs.readFileSync(this.contentPath, {
            encoding: "utf8",
        })
        const lines = contents.split(`\n`)
        const columns = lines[0].split("|").length
        const headers = this.splitLine(lines[0], columns) as ContentHeaders[]
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
            }, new Map() as Map<string, RowMap>)

        return { headers, divider, body }
    }

    // /**
    //  * Add a note to the indexFile
    //  * @param param0
    //  */
    async addNote(noteFrontmatter: any) {
        // read the list
        const { body, headers, divider } = this.read()

        // convert the frontmatter to the row
        const newItem = this.convertFrontmatterToRow(noteFrontmatter)
        // check that the frontmatter doesn't exist already - should already have crashed if this is the case, so this is a redundant check

        if (body.has(newItem.get("title"))) {
            throw new Error(
                chalk.bold.red(
                    `Trying to add a note that already exists, perhaps try updating it instead?`
                )
            )
        }
        body.set(newItem.get("title"), newItem)

        // add the row to the list
        // write the list
        this.updateContent(this.prepareContent(headers, divider, body))
    }

    private prepareContent(
        headers: ContentHeaders[],
        divider: string[],
        body: Map<string, RowMap>
    ) {
        let content = ""
        content += this.convertHeaderToString(headers)
        content += this.convertHeaderToString(divider)
        content += this.convertRowsToString(headers, body)
        return content
    }

    private convertRowsToString(
        headers: ContentHeaders[],
        rows: Map<string, RowMap>
    ) {
        let rowData = ""

        for (let [_, row] of rows) {
            rowData += "|"
            headers.forEach((header) => {
                rowData += `${row.get(header)}|`
            })
            rowData += "\n"
        }
        return rowData
    }

    private convertHeaderToString(line: string[]) {
        return `| ${line.join("|")} |\n`
    }

    private splitLine(line: string, columns: number) {
        return line
            .split("|")
            .slice(1, columns - 1)
            .map((el) => el.trim())
    }

    private convertFrontmatterToRow(
        noteFrontmatter: Map<FrontmatterKeys, any>
    ) {
        const row = new Map() as RowMap
        row.set(
            "title",
            `[${noteFrontmatter.get(
                FrontmatterKeys.Title
            )}](${noteFrontmatter.get(FrontmatterKeys.Slug)})`
        )
        row.set("private", noteFrontmatter.get(FrontmatterKeys.PrivateKey))
        row.set("publish", noteFrontmatter.get(FrontmatterKeys.Publish))
        row.set("date", noteFrontmatter.get(FrontmatterKeys.Date))
        row.set("stage", noteFrontmatter.get(FrontmatterKeys.Stage))
        return row
    }
    // /**
    //  * Update a note
    //  */
    // async updateNote({}: {}) {}

    private updateContent(body: string) {
        fs.writeFileSync(this.contentPath, body, { encoding: "utf8" })
    }
}
