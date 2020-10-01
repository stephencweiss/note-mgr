import { prompt } from "inquirer"
import dayjs from "dayjs"
import kebabCase from "lodash.kebabcase"
import {
    ConfigurationKeys,
    DocumentStages,
    FrontmatterKeys,
    IFrontmatter,
} from "../utils"

interface ISolicitNoteMetadata {
    title?: string
    config: Map<ConfigurationKeys, any>
    options: IFrontmatter
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
            name: "title",
            message: "What's the title for the note?",
            default: options["title"] || title,
        },
        {
            type: "input",
            name: "slug",
            message:
                "What's the slug for the note? (Will default to kebab-style of title)",
            default: options["slug"] || kebabCase(title),
        },
        {
            type: "input",
            name: "category",
            message: "What's the category for the note? (Comma separated)",
            default: String(options["category"]).split(", "),
            filter: (args: any) =>
                String(args)
                    .split(",")
                    .map((tag: string) => tag.trim()),
        },
        {
            type: "input",
            name: "tags",
            message: "Any tags for the note? (Comma separated)",
            default: String(options["tags"]).split(", "),
            filter: (args: any) =>
                String(args)
                    .split(",")
                    .map((tag: string) => tag.trim()),
        },
        {
            type: "input",
            name: "date",
            message: "What is the date for the note?",
            default: dayjs().format(defaultDateFmt),
            filter: (args: any) => dayjs(args).format(defaultDateFmt),
        },
        {
            type: "input",
            name: "publish",
            message: "What is the publish date for the note?",
            default: dayjs().format(defaultDateFmt),
            filter: (args: any) => dayjs(args).format(defaultDateFmt),
        },
        {
            type: "list",
            name: "private",
            message: "Is the note private?",
            choices: [
                { value: false, name: "No" },
                { value: true, name: "Yes" },
            ],
        },
        {
            type: "list",
            name: "stage",
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
        options["title"] = answers.title
        options["slug"] = answers.slug || kebabCase(answers.title)
        options["stage"] = answers.stage
        options["publish"] = answers.publish
        options["date"] = answers.date
        options["private"] = answers.private
        options["category"] = answers.category
        options["tags"] = answers.tags
    })
}
