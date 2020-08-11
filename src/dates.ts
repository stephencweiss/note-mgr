import { prompt } from "inquirer"
import { Command } from "commander"
import { NoteDates, Published } from "./utils"

export async function dates(args: Command) {
    const style = await findStyle(args)
    const noteDates = await new NoteDates(style)
    noteDates.published()
}

async function findStyle(args: Command) {
    let style: Published = Published.Latest
    const { latest, first, recent } = args
    if (!latest && !first && !recent && args.select) {
        style = await solicitTarget()
    }
    if (first) {
        style = Published.First
    }
    if (recent) {
        style = Published.Recent
    }
    return style
}

async function solicitTarget() {
    const questions = [
        {
            type: "list",
            name: "publishStyle",
            message: "Which published date would you like?",
            choices: [
                {
                    value: Published.First,
                    name: "First - the earliest published date among notes",
                },
                {
                    value: Published.Latest,
                    name: "Latest - the latest published date among notes",
                },
                {
                    value: Published.Recent,
                    name:
                        "Recent - the most recent published date among notes (relative to today)",
                },
            ],
        },
    ]
    return await prompt(questions).then((answers) => {
        return answers.publishStyle as Published
    })
}
