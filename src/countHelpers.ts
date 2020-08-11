import chalk from "chalk"
import { Command } from "commander"
import { formatDt, Notes } from "./utils"

export function counters(args: Command) {
    const count = new CountNotes()
    const { date } = args
    if (date) {
        count.byDate("date")
    } else {
        count.byDate("publish")
    }
}

class CountNotes extends Notes {
    async byDate(key: "date" | "publish") {
        let total = 0
        const counted = (await this.frontMatter()).reduce((acc, cur) => {
            const val = formatDt(cur[key])
            console.log({ acc, cur, key: cur[key], val })

            if (acc.has(val)) {
                acc.set(val, acc.get(val) + 1)
            } else {
                acc.set(val, 1)
            }
            total += 1

            return acc
        }, new Map())
        console.log(chalk.bold.blue(`The count of notes by ${key}:\n`))
        for (let [date, count] of counted) {
            console.log(`${date}: ${count}`)
        }
        console.log(chalk.bold.blue(`Total: ${total}`))
        console.log(chalk.bold.blue(`^^^^^^^^^^^\n`))
    }
}
