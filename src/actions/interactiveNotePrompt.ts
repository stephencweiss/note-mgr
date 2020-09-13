import { prompt } from "inquirer"
import dayjs from "dayjs"
import kebabCase from "lodash.kebabcase"
import {
    ConfigurationKeys,
    DocumentStages,
    FrontmatterKeys,
    Frontmatter,
} from "../utils"

interface ISolicitNoteMetadata {
    title?: string
    config: Map<ConfigurationKeys, any>
    options: Frontmatter
}

export async function solicitNoteMetadata({
    title,
    config,
    options,
}: ISolicitNoteMetadata) {
    const defaultDateFmt = config.get(ConfigurationKeys.DEFAULT_DATE_FORMAT)
    const questions = [
        {
            type: "input",
            name: FrontmatterKeys.title,
            message: "What's the title for the note?",
            default: options["title"] || title,
        },
        {
            type: "input",
            name: FrontmatterKeys.slug,
            message:
                "What's the slug for the note? (Will default to kebab-style of title)",
            default: options["slug"] || kebabCase(title),
        },
        {
            type: "input",
            name: FrontmatterKeys.category,
            message: "What's the category for the note? (Comma separated)",
            default: String(options["category"]).split(", "),
            filter: (args: any) =>
                String(args)
                    .split(",")
                    .map((tag: string) => tag.trim()),
        },
        {
            type: "input",
            name: FrontmatterKeys.tags,
            message: "Any tags for the note? (Comma separated)",
            default: String(options["tags"]).split(", "),
            filter: (args: any) =>
                String(args)
                    .split(",")
                    .map((tag: string) => tag.trim()),
        },
        {
            type: "input",
            name: FrontmatterKeys.date,
            message: "What is the date for the note?",
            default: dayjs().format(defaultDateFmt),
            filter: (args: any) => dayjs(args).format(defaultDateFmt),
        },
        {
            type: "input",
            name: FrontmatterKeys.publish,
            message: "What is the publish date for the note?",
            default: dayjs().format(defaultDateFmt),
            filter: (args: any) => dayjs(args).format(defaultDateFmt),
        },
        {
            type: "list",
            name: FrontmatterKeys.private,
            message: "Is the note private?",
            choices: [
                { value: false, name: "No" },
                { value: true, name: "Yes" },
            ],
        },
        {
            type: "list",
            name: FrontmatterKeys.stage,
            message: "What's the stage of the document?",
            choices: [
                { value: DocumentStages.Draft, name: DocumentStages.Draft },
                {
                    value: DocumentStages.In_Review,
                    name: DocumentStages.In_Review,
                },
                {
                    value: DocumentStages.Ready_For_Review,
                    name: DocumentStages.Ready_For_Review,
                },
                {
                    value: DocumentStages.Published,
                    name: DocumentStages.Published,
                },
            ],
        },
    ]

    await prompt(questions).then((answers) => {
        options[FrontmatterKeys.title] = answers.title
        options[FrontmatterKeys.slug] = answers.slug || kebabCase(answers.title)
        options[FrontmatterKeys.stage] = answers.stage
        options[FrontmatterKeys.publish] = answers.publish
        options[FrontmatterKeys.date] = answers.date
        options[FrontmatterKeys.private] = answers.private
        options[FrontmatterKeys.category] = answers.category
        options[FrontmatterKeys.tags] = answers.tags
    })
}
