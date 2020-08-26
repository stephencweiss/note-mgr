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
    category = "category",
    date = "date",
    private = "private",
    publish = "publish",
    slug = "slug",
    stage = "stage",
    tags = "tags",
    title = "title",
}

export interface Frontmatter {
    category: string[]
    date: string
    private: boolean
    publish: string
    slug: string
    stage: DocumentStages
    tags: string[]
    title: string
}

interface IFindNote {
    key: string
    body: Map<string, RowMap>
}

interface IUpdateNote {
    frontmatter: Map<FrontmatterKeys, any>
    dupeCheck?: boolean
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
    readContent() {
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

    async addNote(frontmatter: Map<FrontmatterKeys, any>) {
        this.updateNote({ frontmatter, dupeCheck: true })
    }

    async updateNote({ frontmatter, dupeCheck }: IUpdateNote) {
        const { headers, divider, body } = this.readContent()
        const row = this.convertFrontmatterToRow(frontmatter)

        if (dupeCheck && body.has(row.get("title"))) {
            throw new Error(
                chalk.bold.red(
                    `Trying to add a note that already exists, perhaps try updating it instead?`
                )
            )
        }

        body.set(row.get("title"), row)
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

    private getRowTitle(
        title: FrontmatterKeys.title,
        slug: FrontmatterKeys.slug
    ) {
        return `[${title}](${slug})`
    }

    private convertFrontmatterToRow(
        noteFrontmatter: Map<FrontmatterKeys, any>
    ) {
        const row = new Map() as RowMap
        row.set(
            "title",
            this.getRowTitle(
                noteFrontmatter.get(FrontmatterKeys.title),
                noteFrontmatter.get(FrontmatterKeys.slug)
            )
        )
        row.set("private", noteFrontmatter.get(FrontmatterKeys.private))
        row.set("publish", noteFrontmatter.get(FrontmatterKeys.publish))
        row.set("date", noteFrontmatter.get(FrontmatterKeys.date))
        row.set("stage", noteFrontmatter.get(FrontmatterKeys.stage))
        return row
    }

    removeRow(title: FrontmatterKeys.title, slug: FrontmatterKeys.slug) {
        const key = this.getRowTitle(title, slug)
        const { headers, divider, body } = this.readContent()
        if (!this.findRow({ key, body })) {
            console.log(`No note exists with the key ${key}`)
            throw new Error(`No note exists with the key ${key}`)
        }
        body.delete(key)
        this.updateContent(this.prepareContent(headers, divider, body))
    }

    private findRow({ key, body }: IFindNote) {
        if (!body.has(key)) {
            return false
        }
        return true
    }

    private updateContent(body: string) {
        fs.writeFileSync(this.contentPath, body, { encoding: "utf8" })
    }
}
