import { prompt } from "inquirer"
import fs from "fs"
import os from "os"
import path from "path"

const fsPromises = fs.promises

const HOME = os.homedir()

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
    constructor(targetDir: string) {
        this.validateTarget(targetDir)
    }
    /**
     * Validates that the target directory exists and has the appropriate files saved within.
     * Will create any missed directories or files necessary for the appropriate functioning of this application.
     * The file structure should reflect the following
     * .
     * └── targetDir
     *     ├── drafts
     *     │   └── .drafts.md
     *     └── notes
     *         └── .notes.md
     *
     */
    validateTarget(targetDir: string) {
        const targetPath = path.resolve(HOME, String(targetDir))
        const draftsDir = `${targetPath}/drafts`
        const notesDir = `${targetPath}/notes`
        fsPromises
            .access(targetPath)
            .then(() => {
                console.log(`${targetPath} exists`)
                this.draftsExists(draftsDir)
                this.notesExists(notesDir)
            })
            .catch(() => {
                this.createDraftsDir(draftsDir)
                this.createNotesDir(notesDir)
            })
    }

    draftsExists(draftDir: string) {
        const draftPath = path.resolve(HOME, draftDir)
        fsPromises
            .access(draftPath)
            .then(() => {
                console.log(`${draftPath} exists`)
                fsPromises
                    .access(`${draftPath}/.drafts.md`)
                    .then(() => `${draftPath}/.drafts.md exists`)
                    .catch(() => this.initializeDraftsCatalogue(draftPath))
            })
            .catch(() => {
                this.createDraftsDir(draftDir)
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

    createDraftsDir(draftDir: string) {
        const draftsPath = path.resolve(HOME, draftDir)
        fs.mkdirSync(draftsPath, { recursive: true })
        this.initializeDraftsCatalogue(draftsPath)
        console.log(`created ${draftsPath}`)
    }

    createNotesDir(notesDir: string) {
        const notesPath = path.resolve(HOME, notesDir)
        fs.mkdirSync(notesPath, { recursive: true })
        this.initializeNotesCatalogue(notesPath)
        console.log(`created ${notesPath}`)
    }

    /**
     * The `.drafts.md` file is a catalogue of all drafts
     */
    initializeDraftsCatalogue(path: string) {
        console.log(`path --> `, { path })
        fs.writeFile(`${path}/.drafts.md`, "# Drafts", (err) => {
            if (err)
                throw new Error(
                    `Failed to create .drafts.md at path ${path}.\n${err}`
                )
        })
    }

    /**
     * The `.notes.md` file is a catalogue of all notes
     */
    initializeNotesCatalogue(path: string) {
        console.log(`path --> `, { path })
        fs.writeFile(`${path}/.notes.md`, "# Notes", (err) => {
            if (err)
                throw new Error(
                    `Failed to create .notes.md at path ${path}.\n${err}`
                )
        })
    }
}
