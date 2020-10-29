import { Command, flags } from "@oclif/command"
import chalk from "chalk"
const { prompt } = require("enquirer")
export default class Init extends Command {
    static description = "Initialize nom, the hungry note manager"
    static aliases = ["i", "initialize"]
    static args = [
        {
            name: "targetDir",
            description: "The relative path to the target directory for notes",
        },
    ]
    static examples = [
        `$ nom init`,
        `$ nom init path/to/target/directory`,
        `$ nom i`,
        `$ nom initialize`,
    ]

    async run() {
        try {
            const { args } = this.parse(Init)
            args.targetDir = args.targetDir ?? this.solicitTarget()
            // create nodes directory
            // - this takes the target directory, resolves it against HOME and then passes it into makeFolderSync
            // create configuration file
            // - generate a body for the configuration
            // - takes the resolved path
            // - pass into writeFile
            console.log(
                chalk.greenBright(
                    `Successfully initialized nom at HOME/${args.targetDir}!\nWelcome to a more pleasant life!`
                )
            )
        } catch {
            console.error(
                chalk.bold.red(
                    `Uh oh! Something went wrong with nom's initialization. Please try again.`
                )
            )
        }
    }

    async solicitTarget() {
        return await prompt({
            type: "input",
            name: "targetDir",
            message:
                "In which directory would you like to save your notes?\nThe path should be described relative to $HOME / USERPROFILE.\nNote: If the directory does not yet exist, it will be created.",
            default: ".notes",
        })
            .then(({ targetDir }: { targetDir: string }) => targetDir)
            .catch((error: Error) => console.error(chalk.red.bold(error)))
            .finally(() =>
                console.log(
                    chalk.blueBright(
                        `To automate in the future, set the target directory with the first argument`
                    )
                )
            )
    }
}
