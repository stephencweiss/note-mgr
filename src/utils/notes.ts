// Helpers related to working with notes

import fs from "fs"
import path from "path"
import { prompt } from "inquirer"
import matter from "gray-matter"
import { Config, ConfigurationKeys } from "."
import { Frontmatter, FrontmatterKeys } from "./contentHelpers"

export class Notes extends Config {
    config: Map<ConfigurationKeys, string>
    constructor() {
        super()
        this.config = this.readConfig()
    }

    /**
     * Find a single note interactively
     */
    async find() {
        const rootDir = this.config.get(ConfigurationKeys.NOTES_ROOT_DIR)
        const questions = [
            {
                type: "fuzzypath",
                name: "filePath",
                excludePath: (nodePath: string) =>
                    nodePath.startsWith("node_modules"),
                excludeFilter: (nodePath: string) =>
                    nodePath.startsWith(`${rootDir}/.`),
                itemType: "file",
                rootPath: rootDir,
                message:
                    "Select the note you'd like to update (excludes .dotfiles):",
                default: "",
                suggestOnly: false,
                depthLimit: 0,
            },
        ]

        return await prompt(questions).then(
            (answers) => answers && (answers.filePath as string)
        )
    }

    /**
     * List all notes that are managed by Nom
     */
    list() {
        const rootDir = this.readConfig().get(ConfigurationKeys.NOTES_ROOT_DIR)
        if (!rootDir) {
            throw new Error("Missing root directory. Have you run init?")
        }
        return fs.promises
            .readdir(path.resolve(rootDir), { encoding: "utf8" })
            .then((files) => {
                return files.map((file) => `${rootDir}/${file}`)
            })
            .catch((err) => {
                throw new Error(`Failed to read ${rootDir}`)
            })
    }

    /**
     * Read a single note given a filepath
     * @param filePath
     * @return {} - An object of Frontmatter & the file path
     */
    read(filePath: string) {
        return matter.read(filePath)
    }

    remove(filePath: string) {
        // export function removeNoteFile(filePath: string) {
        if (!this.testPath(filePath)) {
            throw new Error(`No file exists at path ${filePath}`)
        }
        fs.unlinkSync(filePath)
    }

    async testPath(filePath: string) {
        return await fs.promises
            .access(filePath)
            .then(() => true)
            .catch(() => false)
    }

    /**
     * Get the frontmatter for a single note
     * @param filePath
     * @return {} - An object of Frontmatter & the file path
     */
    getFrontmatter(filePath: string) {
        if (!matter.test(filePath)) {
            return { path: filePath } as Frontmatter & { path: string }
        }
        return {
            path: filePath,
            ...this.read(filePath).data,
        } as Frontmatter & { path: string }
    }

    /**
     * Get the frontmatter for all notes managed by Nom,
     * Notes where there is only a key are filtered out (e.g., `.contents` which has no frontmatter).
     */
    async allNotesFrontmatter() {
        return (await this.list())
            .map((file) => this.getFrontmatter(file))
            .filter((note) => Object.keys(note).length > 1)
    }
}
