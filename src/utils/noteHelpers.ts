import fs from "fs"
import dayjs from "dayjs"
import kebabCase from "lodash.kebabcase"
import {
    DocumentStages,
    FrontmatterKeys,
    Frontmatter,
    isValidDt,
    formatDt,
} from "."

export function generateFrontmatter(options: Frontmatter) {
    let frontmatter = ""
    for (let [key, val] of Object.entries(options)) {
        if (key === "private") {
            frontmatter += `private: ${val}` // special handling due to Private being a restricted word in JS
        } else if (typeof val === "string") {
            frontmatter += `${key}: "${val}"`
        } else if (Array.isArray(val)) {
            frontmatter += `${key}: [${val.map((el) => `"${el}"`).join(", ")}]`
        } else {
            frontmatter += `# ${key}: undefined`
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
export function parseArgs(args: any): Frontmatter {
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

    let options = {} as Frontmatter

    options[FrontmatterKeys.title] = title
    options[FrontmatterKeys.slug] = slug
    options[FrontmatterKeys.stage] = stage || DocumentStages.Draft
    options[FrontmatterKeys.date] = (isValidDt(date) && formatDt(date)) || TODAY
    options[FrontmatterKeys.publish] =
        (isValidDt(publish) && formatDt(publish)) || TODAY
    options[FrontmatterKeys.private] = privateKey || false
    options[FrontmatterKeys.category] = category
    options[FrontmatterKeys.tags] = tags

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
