import path from "path"
const fs = require("fs")
import { prompt } from "inquirer"
import { Command } from "commander"
import { Config, HOME, ConfigurationKeys } from "./utils"

const fsPromises = fs.promises

export async function init(commander: Command) {
    const targetDir = commander.targetDir || (await solicitTarget())
    new NoteManagerConfigurer(targetDir).configure()
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

class NoteManagerConfigurer extends Config {
    constructor(targetDir?: string) {
        super(targetDir)
    }

    /**
     * Configures note-mgr.
     * First determines if the necessary directories and files for the application exist.
     * If they do not, this method creates any missed directories or files.
     * The desired file structure is as follows:
     * .
     * └── targetDir
     *     └── .contents.md
     *     └── notes
     * A final step is to save the results to the note-mgr config file.
     */
    configure(): void {
        this.configureSettings()
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
     * Saves the targetDir to a config file in the home directory, `.note-mgr`
     */
    private configureSettings(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                resolve(
                    fsPromises
                        .access(this.CONFIG_PATH)
                        .then(() =>
                            this.updateConfig(
                                ConfigurationKeys.NOTES_ROOT_DIR,
                                this.targetPath
                            )
                        )
                        .catch(
                            () =>
                                new Error(
                                    `Failed to Configure Settings with Target. Please try again.`
                                )
                        )
                )
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Creates a directory in the targetDir to store notes
     */
    private createNotesDir() {
        const notesPath = path.resolve(HOME, `${this.targetPath}/notes`)
        fs.mkdirSync(notesPath, { recursive: true })
    }

    /**
     * Creates an indexFile for the notes based on the configuration setting within the target directory
     */
    private async initializeNotesIndexFile() {
        this.indexFile.then((idxFile) => {
            fs.writeFile(
                `${this.targetPath}/${idxFile}.md`,
                "# Drafts\n\n# Notes\n",
                (error: Error) => {
                    if (error)
                        throw new Error(
                            `Failed to create ${idxFile}.md at path ${this.targetPath}.\n${error.message}`
                        )
                }
            )
        })
    }
}
