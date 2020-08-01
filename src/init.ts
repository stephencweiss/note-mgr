import path from "path"
const fs = require("fs")
import { prompt } from "inquirer"
import { Command } from "commander"
import { Config, HOME, NOTES_ROOT_DIR } from "./utils"

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
        const notesDir = `${this.targetPath}/notes`
        fsPromises
            .access(this.targetPath)
            .catch(() => {
                this.createNotesDir(notesDir)
            })
            .finally(() => {
                this.initializeNotesCatalogue()
                this.configureSettings()
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
                            this.updateConfig(NOTES_ROOT_DIR, this.targetPath)
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

    private createNotesDir(notesDir: string) {
        const notesPath = path.resolve(HOME, notesDir)
        fs.mkdirSync(notesPath, { recursive: true })
    }

    /**
     * The `.notes.md` file is a catalogue of all notes
     */
    private initializeNotesCatalogue() {
        fs.writeFile(
            `${this.targetPath}/${ConfigurationKeys.NOTES_INDEX_FILE}.md`,
            "# Drafts\n\n# Notes\n",
            (error: Error) => {
                if (error)
                    throw new Error(
                        `Failed to create .notes.md at path ${path}.\n${error}`
                    )
            }
        )
    }
}
