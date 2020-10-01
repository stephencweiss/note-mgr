import { prompt } from "inquirer"
import { Command } from "commander"
import { generateErrorMessage, NoteDates, printError, Published } from "./utils"

export async function dates(args: Command, noteCount?: string) {
    try {
        const style = await findStyle(args)
        const noteDates = await new NoteDates({
            style,
            multipleDates: args && args.multipleDates,
            noteCount: Number(noteCount) ?? 1,
        })
        await noteDates.printByStyle()
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
        if (args) {
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
        }
        return style
    } catch (error) {
        printError(error)
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
    return await prompt(questions).then((answers) => answers)
}
