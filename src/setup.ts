import { prompt } from "inquirer"
import fs from "fs"
import os from "os"
import path from "path"

const fsPromises = fs.promises

const HOME = os.homedir()
const NOTES_ROOT_DIR = "NOTES_ROOT_DIR"

interface SetupOptions {
    targetDir?: string
}

export async function setup({ targetDir }: SetupOptions) {
    if (!targetDir) {
        const questions = [
            {
                type: "input",
                name: "targetDir",
                message:
                    "\nIn which directory would you like to save your notes?\nThe path should be described relative to $HOME / USERPROFILE.\nNote: If the directory does not yet exist, it will be created.",
                default: "$HOME",
            },
        ]
        await prompt(questions).then((answers) => {
            console.log(answers)
            targetDir = String(answers.targetDir)
        })
    }
    targetDir && new NoteManagerConfiguration(targetDir)
}

class NoteManagerConfiguration {
    #targetPath = ""
    #noteMgrConfigPath = ""
    #defaultConfigValues = ""
    constructor(targetDir: string) {
        this.#targetPath = path.resolve(HOME, String(targetDir))
        this.#defaultConfigValues = `${NOTES_ROOT_DIR}=${this.#targetPath}`
        this.configureNoteMgr()
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
    configureNoteMgr(): void {
        const notesDir = `${this.#targetPath}/notes`
        fsPromises
            .access(this.#targetPath)
            .then(() => {
                this.notesExists(notesDir)
            })
            .catch(() => {
                this.createNotesDir(notesDir)
            })
            .finally(() => this.setNoteMgrConfig())
    }

    /**
     * Saves the targetDir to a config file in the home directory, `.note-mgr`
     */
    private setNoteMgrConfig(): Promise<void> {
        this.#noteMgrConfigPath = path.resolve(HOME, ".note-mgr")
        return new Promise((resolve, reject) => {
            try {
                resolve(
                    fsPromises
                        .access(this.#noteMgrConfigPath)
                        .then(() => this.updateConfig())
                        .catch(() =>
                            this.writeConfig(this.#defaultConfigValues)
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
                console.log(`${notePath} exists`)
                fsPromises
                    .access(`${notePath}/.notes.md`)
                    .then(() => `${notePath}/.notes.md exists`)
                    .catch(() => this.initializeNotesCatalogue(notePath))
            })
            .catch(() => {
                this.createNotesDir(noteDir)
            })
    }

    async updateConfig() {
        try {
            const data = await this.readConfig()
            const updatedData =
                data &&
                this.modifyConfig(data, NOTES_ROOT_DIR, this.#targetPath)
            updatedData && this.writeConfig(updatedData)
        } catch (error) {
            throw new Error(`Failed to update config`)
        }
    }

    private readConfig(): Promise<string> {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(this.#noteMgrConfigPath, {
                encoding: "utf8",
            })
            let data: string = ""
            readStream.on("data", (chunk) => (data += chunk))
            readStream.on("error", (error) => reject(error))
            readStream.on("end", () => resolve(data))
        })
    }

    /**
     * Takes a config file, and updates the targetKey to the newValue before returning the entire file, recompiled into
     * a unified whole.
     */
    private modifyConfig(data: string, targetKey: string, newValue: string) {
        return data
            .split("\n")
            .map((entry: string) => entry.split("="))
            .map((entry: string[]) => {
                if (entry[0] === targetKey) {
                    entry[1] = newValue
                }
                return entry.join("=")
            })
            .join("\n")
    }
    private writeConfig(data: string) {
        const writeStream = fs.createWriteStream(this.#noteMgrConfigPath, {
            encoding: "utf8",
        })
        writeStream.write(data)
        writeStream.on("error", (error) => new Error(error.message))
        writeStream.on("end", () => {
            console.log(`Successfully updated config`)
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
        console.log(`path --> `, { path })
        fs.writeFile(`${path}/.notes.md`, "# Drafts\n\n# Notes\n", (err) => {
            if (err)
                throw new Error(
                    `Failed to create .notes.md at path ${path}.\n${err}`
                )
        })
    }
}
