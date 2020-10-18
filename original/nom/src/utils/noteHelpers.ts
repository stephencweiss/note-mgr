import fs from "fs"
import dayjs from "dayjs"
import kebabCase from "lodash.kebabcase"
import { DocumentStages, IFrontmatter, isValidDt, formatDt } from "."

export function generateFrontmatter(options: IFrontmatter) {
    let frontmatter = ""
    for (let [key, val] of Object.entries(options)) {
        if (!val) {
            frontmatter += `# ${key}: undefined`
        } else if (key === "private") {
            frontmatter += `private: ${val}` // special handling due to Private being a restricted word in JS
        } else if (key === "date" || key === "publish") {
            frontmatter += `${key}: ${formatDt(val)}`
        } else if (typeof val === "string") {
            frontmatter += `${key}: "${val}"`
        } else if (Array.isArray(val)) {
            frontmatter += `${key}: [${val.map((el) => `"${el}"`).join(", ")}]`
        }

        frontmatter += `\n`
    }
    return `---\n${frontmatter}---\n`
}

/**
 * Creates a new options map for the note - the order in which options are updated matters since we're using a Map.
 * @param args
 * @param config
 */
export function parseArgs(args: any): IFrontmatter {
    const TODAY = dayjs().format("YYYY-MM-DD")
    const {
        category,
        date,
        private: privateKey,
        publish,
        stage,
        tags,
        title,
    } = args
    const slug = kebabCase(args.slug) || kebabCase(title)

    let options = {} as IFrontmatter

    options["title"] = title
    options["slug"] = slug
    options["stage"] = stage || DocumentStages.Draft
    options["date"] = isValidDt(date) ? date : TODAY
    options["publish"] = isValidDt(publish) && publish
    options["private"] = privateKey || false
    options["category"] = category
    options["tags"] = tags

    return options
}

export function saveNoteToDisk({
    filePath,
    body,
}: {
    filePath: string
    body: string
}) {
    fs.writeFile(filePath, body, { encoding: "utf8" }, (err: Error | null) => {
        if (err) {
            throw new Error(`Failed to save note at ${filePath}`)
        }
    })
}
