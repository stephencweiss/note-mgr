import path from "path"
import fs from "fs"
import { prompt } from "inquirer"
import { Command } from "commander"
import { Config, HOME } from "./utils"

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
     *     └── notes
     *         └── .notes.md
     * A final step is to save the results to the note-mgr config file.
     */
    configure(): void {
        const notesDir = `${this.targetPath}/notes`
        fsPromises
            .access(this.targetPath)
            .then(() => {
                this.notesExists(notesDir)
            })
            .catch(() => {
                this.createNotesDir(notesDir)
            })
            .finally(() => this.configureSettings())
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

    notesExists(noteDir: string) {
        const notePath = path.resolve(HOME, noteDir)
        fsPromises
            .access(notePath)
            .then(() => {
                fsPromises
                    .access(`${notePath}/.notes.md`)
                    .then(() => `${notePath}/.notes.md exists`)
                    .catch(() => this.initializeNotesCatalogue(notePath))
            })
            .catch(() => {
                this.createNotesDir(noteDir)
            })
    }

    private createNotesDir(notesDir: string) {
        const notesPath = path.resolve(HOME, notesDir)
        fs.mkdirSync(notesPath, { recursive: true })
        this.initializeNotesCatalogue(notesPath)
    }

    /**
     * The `.notes.md` file is a catalogue of all notes
     */
    private initializeNotesCatalogue(path: string) {
        fs.writeFile(
            `${path}/.notes.md`,
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
