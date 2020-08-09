const fs = require("fs")
import { prompt } from "inquirer"
import dayjs from "dayjs"
import chalk from "chalk"
import kebabCase from "lodash.kebabcase"
import {
    Config,
    ConfigurationKeys,
    FrontmatterKeys,
    validateDt,
    Content,
} from "./utils"
import { Command } from "commander"
require("dotenv").config()
const fsPromises = fs.promises

export async function newNote(title: string | undefined, args: Command) {
    if (!title && !args.title && !args.interactive)
        return console.log(
            chalk.bold.red(
                "A new notes needs a title unless generated interactively (`-i`)."
            )
        )

    const config = new Config()
    const configSettings = config.readConfig()
    const options = parseOptions(args, configSettings)
    if (args.interactive) {
        await solicitOptions(title, configSettings, options)
    }

    if (!options.has(FrontmatterKeys.Slug)) {
        updateOptions(
            options,
            FrontmatterKeys.Slug,
            kebabCase(options.get(FrontmatterKeys.Title))
        )
    }
    console.log({ options })
    createNote(config, options)
    new Content().addNote(options)
    console.log(`Note added!`)
    // todo: add it to `.notes`
}

function generateFilePath(
    config: Config,
    options: Map<FrontmatterKeys | "FileExtension", any>
): string {
    const configSettings = config.readConfig()
    return `${config.nomNotesPath}/${
        options.get(FrontmatterKeys.Slug) ||
        kebabCase(options.get(FrontmatterKeys.Title))
    }.${
        options.get("FileExtension") ||
        configSettings.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION)
    }`
}

async function solicitOptions(
    title: string | undefined,
    config: Map<ConfigurationKeys, any>,
    options: Map<any, any>
) {
    const defaultDateFmt = config.get(ConfigurationKeys.DEFAULT_DATE_FORMAT)
    const questions = [
        {
            type: "input",
            name: FrontmatterKeys.Title,
            message: "What's the title for the note?",
            default: options.get("title") || title,
        },
        {
            type: "input",
            name: FrontmatterKeys.Slug,
            message: "What's the slug for the note?",
            default: options.get("slug") || kebabCase(title),
        },
        {
            type: "input",
            name: FrontmatterKeys.Category,
            message: "What's the category for the note?",
            default: options.get("category"),
        },
        {
            type: "input",
            name: FrontmatterKeys.Tags,
            message: "Any tags for the note? (Comma separated)",
            default: options.get("tags"),
            filter: (args: any) =>
                args.split(",").map((tag: string) => tag.trim()),
        },
        {
            type: "input",
            name: FrontmatterKeys.Date,
            message: "What is the date for the note?",
            default: dayjs().format(defaultDateFmt),
            validate: (args: string) => {
                validateDt(args, defaultDateFmt)
            },
            filter: (args: any) => dayjs(args).format(defaultDateFmt),
        },
        {
            type: "input",
            name: FrontmatterKeys.Publish,
            message: "What is the publish date for the note?",
            default: dayjs().format(defaultDateFmt),
            validate: (args: string) => {
                validateDt(args, defaultDateFmt)
            },
            filter: (args: any) => dayjs(args).format(defaultDateFmt),
        },
        // todo: figure out if I like the confirm vs the list experience
        {
            type: "confirm",
            name: "AltPrivate",
            message: "Is the note public?",
        },
        {
            type: "list",
            name: FrontmatterKeys.PrivateKey,
            message: "Is the note private?",
            choices: [
                { value: false, name: "No" },
                { value: true, name: "Yes" },
            ],
        },
        {
            type: "input",
            name: "FileExtension",
            message: "What's the file extension?",
            default: config.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION),
        },
    ]

    await prompt(questions).then((answers) => {
        updateOptions(options, FrontmatterKeys.Category, answers.Category)
        updateOptions(options, FrontmatterKeys.Date, answers.DateKey)
        updateOptions(options, "FileExtension", answers.FileExtension)
        updateOptions(options, FrontmatterKeys.PrivateKey, answers.PrivateKey)
        updateOptions(options, FrontmatterKeys.Publish, answers.Publish)
        updateOptions(options, FrontmatterKeys.Slug, answers.Slug)
        updateOptions(options, FrontmatterKeys.Tags, answers.Tags)
        updateOptions(options, FrontmatterKeys.Title, answers.Title)
    })
}

async function createNote(config: Config, options: Map<any, any>) {
    const filePath = generateFilePath(config, options)

    // const noteIndex = config.get(ConfigurationKeys.NOTES_INDEX_FILE) // don't need this here, need it in the function that adds to the indexFile
    fsPromises
        .access(filePath)
        .then(() =>
            console.log(
                chalk.red.bold(
                    `${filePath} already exists. Perhaps you meant to edit it instead?`
                )
            )
        )
        .catch(() => {
            fs.writeFile(
                filePath,
                genFrontmatter(options),
                (error: Error | null) => {
                    if (error)
                        throw new Error(
                            `Failed to create ${filePath} at path.\n${error.message}`
                        )
                }
            )
        })
}

function genFrontmatter(options: Map<FrontmatterKeys, any>) {
    let frontmatter = ""
    for (let [key, val] of options) {
        if (key === "PrivateKey") {
            frontmatter += `Private: ${val}` // special handling due to private being a restricted word in JS
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

function parseOptions(args: any, config: Map<ConfigurationKeys, string>) {
    const defaultDateFormat = config.get(ConfigurationKeys.DEFAULT_DATE_FORMAT)
    const TODAY = dayjs().format("YYYY-MM-DD")
    const title = args.args[0] || args.title
    const slug = args.slug || kebabCase(title)
    const { category, date, private: privateKey, publish, tags, custom } = args

    let cliSetOptions = new Map()

    updateOptions(cliSetOptions, FrontmatterKeys.Category, category)
    updateOptions(
        cliSetOptions,
        FrontmatterKeys.Date,
        (validateDt(date, defaultDateFormat) && date) || TODAY
    )
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
    updateOptions(cliSetOptions, FrontmatterKeys.Tags, tags)
    parseCustom(cliSetOptions, custom)
    return cliSetOptions
}

function updateOptions(
    optionsMap: Map<any, any>,
    key: FrontmatterKeys | "FileExtension",
    value?: any
) {
    if (value === undefined || value === null) return
    if (key === FrontmatterKeys.Category || key === FrontmatterKeys.Tags) {
        return optionsMap.set(key, [value])
    }
    optionsMap.set(key, value)
}

function parseCustom(cliSetOptions: Map<any, any>, customArgs: string[]) {
    customArgs?.map((el) => {
        const [key, value] = el.split(":")
        cliSetOptions.set(key, value)
    })
}
