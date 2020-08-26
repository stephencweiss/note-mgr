import fs from "fs"
import dayjs from "dayjs"
import { prompt } from "inquirer"
import matter from "gray-matter"
import kebabCase from "lodash.kebabcase"
import {
    Config,
    ConfigurationKeys,
    DocumentStages,
    FrontmatterKeys,
    validateDt,
} from "../utils"

const fsPromises = fs.promises

export function generateFilePath(
    config: Config,
    options: Map<FrontmatterKeys | "FileExtension", any>
): string {
    const configSettings = config.readConfig()
    return `${config.nomRootPath}/${options.get(FrontmatterKeys.slug)}.${
        options.get("FileExtension") ||
        configSettings.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION)
    }`
}

export function generateFrontmatter(
    options: Map<FrontmatterKeys | "FileExtension", any>
) {
    let frontmatter = ""
    for (let [key, val] of options) {
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
    return `---\n${frontmatter}---
    `
}

export function readNote(path: string) {
    return matter(fs.readFileSync(path, { encoding: "utf8" }))
}

/**
 * Creates a new options map for the note - the order in which options are updated matters since we're using a Map.
 * @param args
 * @param config
 */
export function parseOptions(
    args: any,
    config: Map<ConfigurationKeys, string>
): Map<FrontmatterKeys | "FileExtension", any> {
    const defaultDateFormat = config.get(ConfigurationKeys.DEFAULT_DATE_FORMAT)
    const TODAY = dayjs().format("YYYY-MM-DD")
    const title = args.title
    const slug = kebabCase(args.slug) || kebabCase(title)
    const {
        category,
        date,
        fileExtension,
        private: privateKey,
        publish,
        stage,
        tags,
        custom,
    } = args

    let cliSetOptions = new Map()

    updateOptions(cliSetOptions, FrontmatterKeys.title, title)
    updateOptions(cliSetOptions, FrontmatterKeys.slug, slug || kebabCase(title))
    updateOptions(
        cliSetOptions,
        FrontmatterKeys.stage,
        stage || DocumentStages.Draft
    )
    updateOptions(
        cliSetOptions,
        FrontmatterKeys.date,
        (validateDt(date, defaultDateFormat) && date) || TODAY
    )
    updateOptions(
        cliSetOptions,
        FrontmatterKeys.publish,
        (validateDt(publish, defaultDateFormat) && publish) || TODAY
    )
    updateOptions(cliSetOptions, FrontmatterKeys.private, privateKey || false)
    updateOptions(cliSetOptions, FrontmatterKeys.category, category)
    updateOptions(cliSetOptions, FrontmatterKeys.tags, tags)
    updateOptions(cliSetOptions, "FileExtension", fileExtension)
    parseCustom(cliSetOptions, custom)
    return cliSetOptions
}

export function updateOptions(
    optionsMap: Map<FrontmatterKeys | any, any>,
    key: FrontmatterKeys | "FileExtension",
    value?: any
) {
    optionsMap.set(key, value)
}

/**
 * If a custom option is included, parse it and add to the options passed in from the CLI like a regular option to be
 * included in the frontmatter.
 * @param cliSetOptions
 * @param customArgs
 */
function parseCustom(
    cliSetOptions: Map<FrontmatterKeys | any, any>,
    customArgs: string[]
) {
    customArgs?.map((el) => {
        const [key, value] = el.split(":")
        cliSetOptions.set(key, value)
    })
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

export async function testPath(notePath: string) {
    return await fsPromises
        .access(notePath)
        .then(() => true)
        .catch(() => false)
}

export async function findNote(config: Map<ConfigurationKeys, string>) {
    const rootDir = config.get(ConfigurationKeys.NOTES_ROOT_DIR)!
    const questions = [
        {
            type: "fuzzypath",
            name: "filePath",
            excludePath: (nodePath: string) =>
                nodePath.startsWith("node_modules"),
            excludeFilter: (nodePath: string) => nodePath.startsWith("."),
            itemType: "file",
            rootPath: rootDir,
            message: "Select the note you'd like to update:",
            default: "",
            suggestOnly: false,
            depthLimit: 0,
        },
    ]

    return await prompt(questions).then(
        (answers) => answers && (answers.filePath as string)
    )
}

export function removeNoteFile(filePath: string) {
    if (!testPath(filePath)) {
        throw new Error(`No file exists at path ${filePath}`)
    }
    fs.unlinkSync(filePath)
}
