// Helpers related to working with notes

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { Config, ConfigurationKeys } from "."
import { Frontmatter, FrontmatterKeys } from "./contentHelpers"

export class Notes extends Config {
    config: Map<ConfigurationKeys, string>
    constructor() {
        super()
        this.config = this.readConfig()
    }

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
     *
     * @param filePath
     * @return {} - An object of Frontmatter & the file path
     */
    readNote(filePath: string) {
        return matter.read(filePath)
    }

    /**
     *
     * @param filePath
     * @return {} - An object of Frontmatter & the file path
     */
    getFrontmatter(filePath: string) {
        if (!matter.test(filePath)) {
            return { path: filePath } as Frontmatter & { path: string }
        }
        return {
            path: filePath,
            ...this.readNote(filePath).data,
        } as Frontmatter & { path: string }
    }

    async allNotesFrontmatter() {
        return (await this.list())
            .map((file) => this.getFrontmatter(file))
            .filter((note) => Object.keys(note).length > 1) // filter out any notes where the only key is path
    }
}
