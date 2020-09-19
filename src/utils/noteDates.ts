import chalk from "chalk"
import dayjs from "dayjs"
import { Notes } from "./notes"
import { IFrontmatter } from "./contentHelpers"

export enum Published {
    First = "FIRST",
    Latest = "LATEST",
    Recent = "RECENT",
}

export class NoteDates extends Notes {
    style: Published = Published.Latest
    constructor(style: Published) {
        super()
        this.style = style
    }
    async published() {
        try {
            const notes = await new Notes().allNotesFrontmatter()

            let published = notes.filter(
                (note) => note && note.publish
            ) as IFrontmatter[]

            if (this.style === Published.Recent) {
                const TODAY = dayjs()
                published = published.filter((note: IFrontmatter) =>
                    TODAY.isAfter(note.publish)
                )
            }

            const sortFn = this.pickSort(this.style)
            const sorted = published.sort(sortFn)

            console.log(
                chalk.bold(
                    `The published date according to the ${this.style} filter is:`
                )
            )
            console.log(chalk.bold(sorted[sorted.length - 1].publish))
        } catch (error) {
            throw new Error("Failed to calculate dates\n${error}")
        }
    }

    private pickSort(style: Published) {
        if (style === Published.First) {
            return (a: IFrontmatter, b: IFrontmatter) =>
                dayjs(a.publish).isAfter(dayjs(b.publish)) ? -1 : 1
        } else {
            return (a: IFrontmatter, b: IFrontmatter) =>
                dayjs(b.publish).isAfter(dayjs(a.publish)) ? -1 : 1
        }
    }
}
