// Helpers related to working with notes
import fs from "fs"
import path from "path"
import { prompt } from "inquirer"
import matter from "gray-matter"
import { Config, ConfigurationKeys } from "."
import { IFrontmatter } from "./contentHelpers"

export class Notes extends Config {
    config: Map<ConfigurationKeys, string>
    constructor() {
        super()
        this.config = this.readConfig()
    }

    /**
     * Generate a full file path from $HOME
     * @param options
     */
    generateFilePath(options: IFrontmatter): string {
        const configSettings = this.readConfig()
        return `${this.nomRootPath}/${options["slug"]}.${configSettings.get(
            ConfigurationKeys.DEFAULT_FILE_EXTENSION
        )}`
    }

    /**
     * Extract the file path relative to other notes; useful in generating titles for content rows
     * @param filePath
     * @example getRelativeFilePath('/User/john/path/to/nom/directory/test-file.md) // test-file
     *
     */
    getRelativeFilePath(filePath: string) {
        const directoryPath = `${this.nomRootPath}/`
        const fileExtension = new RegExp(
            `.${this.readConfig().get(
                ConfigurationKeys.DEFAULT_FILE_EXTENSION
            )}$`
        )
        return filePath.replace(directoryPath, "").replace(fileExtension, "")
    }

    /**
     * Generate the [title](slug) combination for use in the `.contents` file
     * @param options
     */
    generateRowTitle(options: IFrontmatter, filePath?: string) {
        if (!options["title"]) {
            throw new Error(`No Title in Frontmatter ${options}`)
        }
        return `[${options["title"]}](${
            filePath ? this.getRelativeFilePath(filePath) : options["slug"]
        })`
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
        try {
            return {
                ...this.read(filePath).data,
            } as IFrontmatter
        } catch (error) {
            throw new Error(
                `Failed to read frontmatter for file at ${filePath}\n${error}`
            )
        }
    }

    /**
     * Get the frontmatter for all notes managed by Nom,
     * Notes where there is only a key are filtered out (e.g., `.contents` which has no frontmatter).
     */
    async allNotesFrontmatter(): Promise<IFrontmatter[]> {
        try {
            return (await this.list())
                .map((file) => this.getFrontmatter(file))
                .filter(
                    (note) => note && Object.keys(note).length > 1
                ) as IFrontmatter[]
        } catch (error) {
            throw new Error("Failed to get frontmatter\n${error}")
        }
    }
}
