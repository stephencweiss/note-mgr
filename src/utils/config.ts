const os = require("os")
const path = require("path")
const fs = require("fs")

const fsPromises = fs.promises

export const HOME = os.homedir()

export enum ConfigurationKeys {
    NOTES_ROOT_DIR = "NOTES_ROOT_DIR",
    DEFAULT_FILE_EXTENSION = "DEFAULT_FILE_TYPE",
    NOTES_INDEX_FILE = "NOTES_INDEX_FILE",
    DEFAULT_DATE_FORMAT = "DEFAULT_DATE_FORMAT",
}

interface ConfigurationOptions {
    targetPath: string
    defaultDtFormat: string
    defaultFileExtension: string
    defaultIndexFile: string
}

export class Config {
    CONFIG_PATH = path.resolve(HOME, ".note-mgr")
    protected targetPath = ""
    protected defaultDtFormat = "YYYY-MM-DD"
    protected defaultFileExtension = "md"
    protected defaultIndexFile = ".contents"
    constructor(targetDir?: string) {
        this.targetPath = path.resolve(HOME, targetDir || ".notes")
        this.initializeConfig({
            defaultDtFormat: this.defaultDtFormat,
            defaultFileExtension: this.defaultFileExtension,
            defaultIndexFile: this.defaultIndexFile,
            targetPath: this.targetPath,
        }).catch(() =>
            console.log(`Failed to Initialize Config. Please try again.`)
        )
    }

    /**
     * If the configuration for `note-mgr` doesn't already exist, initialize it
     */
    async initializeConfig({
        defaultDtFormat,
        defaultFileExtension,
        defaultIndexFile,
        targetPath,
    }: ConfigurationOptions) {
        fsPromises.access(this.CONFIG_PATH).catch(() => {
            const baseConfig = new Map()
            baseConfig.set(
                ConfigurationKeys.DEFAULT_DATE_FORMAT,
                defaultDtFormat
            )
            baseConfig.set(
                ConfigurationKeys.DEFAULT_FILE_EXTENSION,
                defaultFileExtension
            )
            baseConfig.set(ConfigurationKeys.NOTES_ROOT_DIR, targetPath)
            baseConfig.set(ConfigurationKeys.NOTES_INDEX_FILE, defaultIndexFile)
            this.writeConfig(baseConfig)
        })
    }

    readConfig(): Promise<Map<string, string>> {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(this.CONFIG_PATH, {
                encoding: "utf8",
            })
            let data: string = ""
            readStream.on("data", (chunk: string) => (data += chunk))
            readStream.on("error", (error: Error) => reject(error))
            readStream.on("end", () =>
                resolve(
                    data
                        .split("\n")
                        .reduce((acc: Map<string, string>, cur: string) => {
                            const [key, val] = cur.split("=")
                            if (key && val) {
                                acc.set(key, val)
                            }
                            return acc
                        }, new Map())
                )
            )
        })
    }

    async updateConfig(key: string, value: string) {
        try {
            const data = await this.readConfig()
            const updatedData = data.set(key, value)
            this.writeConfig(updatedData)
        } catch (error) {
            throw new Error(`Failed to update config`)
        }
    }

    writeConfig(config: Map<string, string>) {
        const writeStream = fs.createWriteStream(this.CONFIG_PATH, {
            encoding: "utf8",
        })
        let data = ""
        for (let [key, value] of config) {
            data += `${key}=${value}\n`
        }
        writeStream.write(data)
        writeStream.on("error", (error: Error) => new Error(error.message))
        writeStream.on("end", () => {
            console.log(`Successfully updated config`)
        })
    }

    /** Common accessors of the config */
    /**
     * The nomRootPath getter returns a promise for the path to the directory housing all of `nom` relative to $HOME / USERPROFILE
     */
    get nomRootPath() {
        return path.resolve(
            HOME,
            this.readConfig().then((config) =>
                config.get(ConfigurationKeys.NOTES_ROOT_DIR)
            )
        )
    }
    /**
     * The nomNotesPath getter returns a promise for the path to the `nom` directory of Notes relative to $HOME / USERPROFILE
     */
    get nomNotesPath() {
        return this.readConfig().then((config) =>
            path.resolve(
                HOME,
                `${config.get(ConfigurationKeys.NOTES_ROOT_DIR)}/notes`
            )
        )
    }
    /**
     * The defaultDateFormat returns a promise for the default file extension set for the all new notes
     */
    get defaultDateFormat() {
        return this.readConfig().then((config) =>
            config.get(ConfigurationKeys.DEFAULT_DATE_FORMAT)
        )
    }
    /**
     * The defaultFileExt returns a promise for the default file extension set for the all new notes
     */
    get defaultFileExt() {
        return this.readConfig().then((config) =>
            config.get(ConfigurationKeys.DEFAULT_FILE_EXTENSION)
        )
    }

    /**
     * indexFile returns a promise for the name of the index file (default is `.contents`) that will store a reference to all notes
     */
    get indexFile() {
        return this.readConfig().then((config) =>
            config.get(ConfigurationKeys.NOTES_INDEX_FILE)
        )
    }

    /**
     * indexPath returns a promise for the path to the index file relative to $HOME / USERPROFILE
     */
    async indexPath() {
        return path.resolve(HOME, await this.indexFile)
    }
}
