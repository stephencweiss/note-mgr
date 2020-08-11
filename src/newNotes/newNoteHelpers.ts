import dayjs from "dayjs"
import kebabCase from "lodash.kebabcase"
import {
    Config,
    ConfigurationKeys,
    DocumentStages,
    FrontmatterKeys,
    validateDt,
} from "../utils"

export function generateFilePath(
    config: Config,
    options: Map<FrontmatterKeys | "FileExtension", any>
): string {
    const configSettings = config.readConfig()
    return `${config.nomRootPath}/${
        options.get(FrontmatterKeys.Slug) ||
        kebabCase(options.get(FrontmatterKeys.Title))
    }.${
        options.get("FileExtension") ||
        configSettings.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION)
    }`
}

export function generateFrontmatter(options: Map<FrontmatterKeys, any>) {
    let frontmatter = ""

    for (let [key, val] of options) {
        if (key === "PrivateKey") {
            frontmatter += `Private: ${val}` // special handling due to Private being a restricted word in JS
        } else if (key === "DateKey") {
            frontmatter += `Date: ${val}` // special handling due to Date being a restricted word in JS
        } else if (typeof val === "string") {
            frontmatter += `${key}: "${val}"`
        } else if (Array.isArray(val)) {
            frontmatter += `${key}: [${val.map((el) => `"${el}"`).join(", ")}]`
        } else {
            frontmatter += `# ${key}: undefined`
        }
        frontmatter += `\n`
    }
    return `---\n${frontmatter}---\n
    `
}

export function parseOptions(
    args: any,
    config: Map<ConfigurationKeys, string>
): Map<FrontmatterKeys | "FileExtension", any> {
    const defaultDateFormat = config.get(ConfigurationKeys.DEFAULT_DATE_FORMAT)
    const TODAY = dayjs().format("YYYY-MM-DD")
    const title = args.args[0] || args.title
    const slug = args.slug || kebabCase(title)
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

    updateOptions(cliSetOptions, FrontmatterKeys.Category, category)
    updateOptions(
        cliSetOptions,
        FrontmatterKeys.Date,
        (validateDt(date, defaultDateFormat) && date) || TODAY
    )
    updateOptions(cliSetOptions, "FileExtension", fileExtension)
    updateOptions(cliSetOptions, FrontmatterKeys.Title, title)
    updateOptions(
        cliSetOptions,
        FrontmatterKeys.PrivateKey,
        privateKey || false
    )
    updateOptions(
        cliSetOptions,
        FrontmatterKeys.Publish,
        (validateDt(publish, defaultDateFormat) && publish) || TODAY
    )
    updateOptions(cliSetOptions, FrontmatterKeys.Slug, slug)
    updateOptions(
        cliSetOptions,
        FrontmatterKeys.Stage,
        stage || DocumentStages.Draft
    )
    updateOptions(cliSetOptions, FrontmatterKeys.Tags, tags)
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
