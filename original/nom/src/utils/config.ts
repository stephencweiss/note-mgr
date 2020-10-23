import chalk from "chalk"
import os from "os"
import path from "path"
import fs from "fs"

export const HOME = os.homedir()

export enum ConfigurationKeys {
    NOTES_ROOT_DIR = "NOTES_ROOT_DIR",
    DEFAULT_FILE_EXTENSION = "DEFAULT_FILE_TYPE",
    NOTES_INDEX_FILE = "NOTES_INDEX_FILE",
    DEFAULT_DATE_FORMAT = "DEFAULT_DATE_FORMAT",
}

interface ConfigurationOptions {
    targetDir: string
    defaultDtFormat?: string
    defaultFileExtension?: string
    defaultIndexFile?: string
}

export class Config {
    CONFIG_PATH = path.resolve(HOME, ".note-mgr")
    protected targetPath = ""
    protected defaultDtFormat = "YYYY-MM-DD"
    protected defaultFileExtension = "md"
    protected defaultIndexFile = ".contents"

    /**
     * If the configuration for `note-mgr` doesn't already exist, initialize it
     */
    init({
        defaultDtFormat = this.defaultDtFormat,
        defaultFileExtension = this.defaultFileExtension,
        defaultIndexFile = this.defaultIndexFile,
        targetDir,
    }: ConfigurationOptions) {
        this.targetPath = path.resolve(HOME, targetDir || ".notes")
        const baseConfig = new Map()
        baseConfig.set(ConfigurationKeys.DEFAULT_DATE_FORMAT, defaultDtFormat)
        baseConfig.set(
            ConfigurationKeys.DEFAULT_FILE_EXTENSION,
            defaultFileExtension
        )
        baseConfig.set(ConfigurationKeys.NOTES_ROOT_DIR, this.targetPath)
        baseConfig.set(ConfigurationKeys.NOTES_INDEX_FILE, defaultIndexFile)
        this.writeConfig(baseConfig)
    }

    configExists(): void {
        try {
            fs.accessSync(this.CONFIG_PATH)
        } catch {
            throw new Error(
                chalk.bold.red(
                    `Config doesn't exist at ${this.CONFIG_PATH}. Have you run init?`
                )
            )
        }
    }

    readConfig(): Map<ConfigurationKeys, string> {
        this.configExists()
        const configContents = fs.readFileSync(this.CONFIG_PATH, {
            encoding: "utf8",
        })
        return configContents
            .split("\n")
            .reduce((acc: Map<ConfigurationKeys, string>, cur: string) => {
                const [key, val] = cur.split("=")
                if (key && val) {
                    acc.set(key as ConfigurationKeys, val)
                }
                return acc
            }, new Map())
    }

    async updateConfig(key: ConfigurationKeys, value: string) {
        try {
            const data = this.readConfig()
            const updatedData = data.set(key, value)
            this.writeConfig(updatedData)
        } catch (error) {
            throw new Error(`Failed to update config`)
        }
    }

    writeConfig(config: Map<string, string>) {
        let data = ""
        for (let [key, value] of config) {
            data += `${key}=${value}\n`
        }
        fs.writeFileSync(this.CONFIG_PATH, data, { encoding: "utf8" })
    }

    /** Common accessors of the config */
    /**
     * The nomRootPath getter returns a promise for the path to the directory housing all of `nom` relative to $HOME / USERPROFILE
     */
    get nomRootPath() {
        const rootDir = this.readConfig().get(ConfigurationKeys.NOTES_ROOT_DIR)
        if (!rootDir) {
            throw new Error("Missing root directory. Have you run init?")
        }
        return path.resolve(HOME, rootDir)
    }

    /**
     * indexPath returns a promise for the path to the index file relative to $HOME / USERPROFILE
     */
    indexPath() {
        const indexFile = this.readConfig().get(
            ConfigurationKeys.NOTES_INDEX_FILE
        )
        if (!indexFile) {
            throw new Error("Missing root directory. Have you run init?")
        }
        return path.resolve(this.nomRootPath, indexFile)
    }
}
