import chalk from "chalk"
import dayjs from "dayjs"
import { Notes, Frontmatter } from "."

export enum Published {
    First = "FIRST",
    Latest = "LATEST",
    Recent = "RECENT",
}

export class NoteDates extends Notes {
    style: Published = Published.Latest
    constructor(style: Published) {
        super()
        if (style) {
            this.style = style
        }
    }
    async published() {
        const notes = await new Notes().frontMatter()
        let published = notes.filter((note) => note.publish)

        if (this.style === Published.Recent) {
            const TODAY = dayjs()
            published = published.filter((note) => TODAY.isAfter(note.publish))
        }

        const sortFn = this.pickSort(this.style)
        const sorted = published.sort(sortFn)

        console.log(
            chalk.bold(
                `The published date according to the ${this.style} filter is:`
            )
        )
        console.log(chalk.bold(sorted[sorted.length - 1].publish))
    }

    private pickSort(style: Published) {
        if (style === Published.First) {
            return (
                a: Frontmatter & { path: string },
                b: Frontmatter & { path: string }
            ) => (a.publish > b.publish ? -1 : 1)
        } else {
            return (
                a: Frontmatter & { path: string },
                b: Frontmatter & { path: string }
            ) => (a.publish < b.publish ? -1 : 1)
        }
    }
}
