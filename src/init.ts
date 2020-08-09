import path from "path"
import fs from "fs"
import { prompt } from "inquirer"
import { Command } from "commander"
import { Config, HOME, ConfigurationKeys } from "./utils"
import { ContentHeaders } from "./utils"

const fsPromises = fs.promises

export async function init(commander: Command) {
    const configurer = new NoteManagerConfigurer()
    const targetDir = commander.targetDir || (await solicitTarget())
    configurer.init({ targetDir })
    configurer.configure()
}

async function solicitTarget() {
    const questions = [
        {
            type: "input",
            name: "targetDir",
            message:
                "In which directory would you like to save your notes?\nThe path should be described relative to $HOME / USERPROFILE.\nNote: If the directory does not yet exist, it will be created.",
            default: ".notes",
        },
    ]
    return await prompt(questions).then((answers) => answers.targetDir)
}

/**
 * Configures note-mgr.
 * First determines if the necessary directories and files for the application exist.
 * If they do not, this method creates any missed directories or files.
 * The desired file structure is as follows:
 * .
 * └── targetDir
 *     └── .contents.md
 *     └── note-one.md
 *     └── ....
 *     └── note-one-hundred.md
 * A final step is to save the results to the note-mgr config file.
 */
class NoteManagerConfigurer extends Config {
    configure(): void {
        fsPromises
            .access(this.targetPath)
            .catch(() => {
                this.createNotesDir()
            })
            .finally(() => {
                this.initializeNotesIndexFile()
            })
    }

    /**
     * Creates a directory in the targetDir to store notes
     */
    private createNotesDir() {
        const notesPath = path.resolve(HOME, `${this.targetPath}`)
        fs.mkdirSync(notesPath, { recursive: true })
    }

    /**
     * Creates an indexFile for the notes based on the configuration setting within the target directory
     */
    private async initializeNotesIndexFile() {
        const indexFile = this.readConfig().get(
            ConfigurationKeys.NOTES_INDEX_FILE
        )

        const headers: ContentHeaders[] = ["title", "date", "stage"]
        const body = `| ${headers.join("|")} |\n | ${headers
            .map((_) => `---`)
            .join("|")}|\n`

        fs.writeFile(
            `${this.targetPath}/${indexFile}.md`,
            body,
            (error: Error) => {
                if (error)
                    throw new Error(
                        `Failed to create ${indexFile}.md at path ${this.targetPath}.\n${error.message}`
                    )
            }
        )
    }
}
