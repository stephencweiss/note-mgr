import { prompt } from "inquirer"
import { Command } from "commander"
import { generateErrorMessage, NoteDates, printError, Published } from "./utils"

export async function dates(args: Command) {
    try {
        const style = await findStyle(args)
        const noteDates = await new NoteDates(style)
        await noteDates.published()
    } catch (error) {
        printError(
            generateErrorMessage(
                error,
                `Failed to calculate the date for ${JSON.stringify(
                    await findStyle(args),
                    null,
                    4
                )}`
            )
        )
    }
}

async function findStyle(args: Command) {
    try {
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
    } catch (error) {
        throw new Error(generateErrorMessage(error))
    }
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
