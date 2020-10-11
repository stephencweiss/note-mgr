import chalk from "chalk"
import { Command } from "commander"
import { formatDt, Notes, IFrontmatter, FrontmatterKeys } from "./utils"

export function counters(args: Command) {
    const { category, date, publish, stage, tags } = args

    const styles: FrontmatterKeys[] = []
    if (category) {
        styles.push("category")
    }
    if (tags) {
        styles.push("tags")
    }
    if (date) {
        styles.push("date")
    }
    if (stage) {
        styles.push("stage")
    }
    if (publish) {
        styles.push("publish")
    }
    new CountNotes(styles).count()
}

class CountNotes extends Notes {
    counted: Map<string, number> = new Map()
    styles?: FrontmatterKeys[] = []
    total = 0
    notes: Array<IFrontmatter> = []
    constructor(styles?: FrontmatterKeys[]) {
        super()
        this.styles = styles
    }
    async count() {
        try {
            this.notes = await this.allNotesFrontmatter()
            this.total = this.notes.length
            if (!this.styles || this.styles.length === 0) {
                this.print()
            }
            this.styles!.forEach(async (style) => await this.byStyle(style))
        } catch (error) {
            throw new Error(`Failed to construct the CountNotes\n${error}`)
        }
    }
    print(style?: FrontmatterKeys) {
        if (style) {
            console.log(chalk.bold(`The count of notes by ${style}:`))
            for (let [date, count] of this.counted) {
                console.log(chalk.bold(`${date}: ${count}`))
            }
        }
        console.log(chalk.bold(`Total note count: ${this.total}`))
    }

    async byStyle(style: FrontmatterKeys) {
        this.counted = this.notes.reduce((acc, cur) => {
            const val = this.findVal(style, cur)
            if (Array.isArray(val)) {
                val.forEach((value) => {
                    if (acc.has(value)) {
                        acc.set(value, acc.get(value) + 1)
                    } else {
                        acc.set(value, 1)
                    }
                })
            } else {
                if (acc.has(val)) {
                    acc.set(val, acc.get(val) + 1)
                } else {
                    acc.set(val, 1)
                }
            }

            return acc
        }, new Map())
        this.print(style)
    }
    private findVal(
        targetFrontmatter: keyof IFrontmatter,
        frontmatterObj: IFrontmatter
    ) {
        if (targetFrontmatter === "date" || targetFrontmatter === "publish") {
            return formatDt(frontmatterObj[targetFrontmatter] as string)
        }
        return frontmatterObj[targetFrontmatter]
    }
}
