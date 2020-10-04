import chalk from "chalk"
import fs from "fs"
import path from "path"
import { Config, ConfigurationKeys, parseLink } from "."
import { Notes } from "./notes"

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
    IFrontmatter,
    "date" | "private" | "publish" | "slug" | "stage" | "title"
>
type RowMap = Map<keyof ContentRow, any>

export interface IFrontmatter {
    category: string[]
    date: string
    private: boolean
    publish: string
    slug: string
    stage: DocumentStages
    tags: string[]
    title: string
}

export type FrontmatterKeys = keyof IFrontmatter

export function generateFrontmatterObj(args: IFrontmatter & any) {
    return {
        category: args["category"],
        date: args["date"],
        private: args["private"],
        publish: args["publish"],
        slug: args["slug"],
        stage: args["stage"],
        tags: args["tags"],
        title: args["title"],
    } as IFrontmatter
}

interface IUpdateNote {
    frontmatter: IFrontmatter
    dupeCheck?: boolean
    filePath?: string
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
                const { title, slug } = this.parseTitle(curLine[0])
                frontmatter.set("title", title)
                frontmatter.set("slug", slug)
                acc.set(curLine[0], frontmatter)
                return acc
            }, new Map() as Map<string, RowMap>)

        return { headers, divider, body }
    }

    private parseTitle(rowTitle: string) {
        const returnVal = parseLink(rowTitle)
        const [_, title, slug] = returnVal
        return { title, slug }
    }

    addNote(frontmatter: IFrontmatter) {
        this.updateNote({ frontmatter, dupeCheck: true })
    }

    addNotes(
        notesFrontmatter: IFrontmatter[],
        headers: ContentHeaders[],
        divider: string[],
        body: Map<string, RowMap>
    ) {
        const rows = notesFrontmatter.map((frontmatter) =>
            this.convertFrontmatterToRow(frontmatter)
        )
        rows.forEach((row) => body.set(row.get("title"), row))
        this.updateContent(this.prepareContent(headers, divider, body))
    }

    updateNote({ frontmatter, dupeCheck, filePath }: IUpdateNote) {
        const { headers, divider, body } = this.readContent()
        const row = this.convertFrontmatterToRow(frontmatter, filePath)

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

    private convertFrontmatterToRow(
        noteFrontmatter: IFrontmatter,
        filePath?: string
    ) {
        const notes = new Notes()
        const row = new Map() as RowMap
        row.set("title", notes.generateRowTitle(noteFrontmatter, filePath))
        row.set("private", noteFrontmatter["private"])
        row.set("publish", noteFrontmatter["publish"])
        row.set("date", noteFrontmatter["date"])
        row.set("stage", noteFrontmatter["stage"])
        return row
    }

    removeRow(rowTitle: string) {
        const { headers, divider, body } = this.readContent()
        if (!this.testRowTitle(rowTitle)) {
            console.log(`No note exists with the rowTitle ${rowTitle}`)
            throw new Error(`No note exists with the rowTitle ${rowTitle}`)
        }
        body.delete(rowTitle)
        this.updateContent(this.prepareContent(headers, divider, body))
    }

    testRowTitle(rowTitle: string) {
        const { body } = this.readContent()
        return body.has(rowTitle)
    }

    private updateContent(body: string) {
        fs.writeFileSync(this.contentPath, body, { encoding: "utf8" })
    }
}
