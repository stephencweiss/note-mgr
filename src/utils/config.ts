const os = require("os")
const path = require("path")
const fs = require("fs")

const fsPromises = fs.promises

export const HOME = os.homedir()
export const NOTES_ROOT_DIR = "NOTES_ROOT_DIR"

export class Config {
    CONFIG_PATH = path.resolve(HOME, ".note-mgr")
    protected targetPath = ""
    constructor(targetDir?: string) {
        this.targetPath = path.resolve(HOME, targetDir || ".notes")
        this.initializeConfig(this.targetPath).catch(() =>
            console.log(`Failed to Initialize Config. Please try again.`)
        )
    }

    /**
     * If the configuration for `note-mgr` doesn't already exist, initialize it
     */
    async initializeConfig(targetPath: string = ".notes") {
        fsPromises.access(this.CONFIG_PATH).catch(() => {
            const baseConfig = new Map()
            baseConfig.set(NOTES_ROOT_DIR, targetPath)
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
}
