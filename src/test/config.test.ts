import { Config } from "../src/utils"

function main() {
    const config = new Config()
    try {
        config.configExists()
        console.log(`success`)
    } catch (error) {
        console.log(`failure\n${error}`)
    }
}

main()
