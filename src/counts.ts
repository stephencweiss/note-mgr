import chalk from "chalk"
import { Command } from "commander"
import { formatDt, Notes, Frontmatter } from "./utils"

type Style = "date" | "publish" | "stage"
export function counters(args: Command) {
    const { date, publish, stage } = args
    console.log({ date, publish, stage })
    const styles: Style[] = []
    if (date) {
        styles.push("date")
    }
    if (stage) {
        styles.push("stage")
    }
    if (publish) {
        styles.push("publish")
    }
    new CountNotes(styles)
}

class CountNotes extends Notes {
    counted: Map<string, number> = new Map()
    styles: Style[] = []
    total = 0
    notes: Array<Frontmatter & { path: string }> = []
    constructor(styles: Style[]) {
        super()
        this.styles = styles
        this.fetchNotes().then(() => {
            this.total = this.notes.length
            styles.forEach((style) => this.byStyle(style))
        })
    }
    private async fetchNotes() {
        this.notes = await this.frontMatter()
        return this.notes
    }
    print(style: Style) {
        console.log(chalk.bold.blue(`The count of notes by ${style}:\n`))
        for (let [date, count] of this.counted) {
            console.log(`${date}: ${count}`)
        }
        console.log(chalk.bold.blue(`Total: ${this.total}`))
        console.log(chalk.bold.blue(`^^^^^^^^^^^\n`))
    }

    async byStyle(style: Style) {
        this.counted = this.notes.reduce((acc, cur) => {
            const val = style === "stage" ? cur[style] : formatDt(cur[style])
            if (acc.has(val)) {
                acc.set(val, acc.get(val) + 1)
            } else {
                acc.set(val, 1)
            }
            return acc
        }, new Map())
        this.print(style)
    }
}
