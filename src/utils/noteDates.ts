import chalk from "chalk"
import dayjs from "dayjs"
import { Notes } from "./notes"
import { IFrontmatter } from "./contentHelpers"
import { formatDt, isValidDt } from "./dateHelpers"
import { generateErrorMessage } from "./errorMessages"

export enum Published {
    First = "FIRST",
    Latest = "LATEST",
    Recent = "RECENT",
}
const TODAY = dayjs()
export class NoteDates extends Notes {
    style: Published
    notes: IFrontmatter[] = []
    noteCount: number = 1 // -1 is used to indicate _all_ notes
    printList: string[] = []
    printString: string = ""
    constructor({
        style = Published.Latest,
        multipleDates = false,
        noteCount,
    }: {
        style: Published
        multipleDates: boolean
        noteCount: number
    }) {
        super()
        this.style = style
        this.noteCount = multipleDates ? -1 : noteCount ? noteCount : 1
        this.setNotes().then((res) => {
            this.notes = res
        })
    }

    private async setNotes() {
        try {
            return this.allNotesFrontmatter()
        } catch (error) {
            throw new Error(generateErrorMessage(error, `Failed to set notes`))
        }
    }

    async printByStyle() {
        try {
            await this.filterByStyle()
            this.preparePrintList()
            this.print()
        } catch (error) {
            throw new Error(
                generateErrorMessage(error, `Failed to calculate dates`)
            )
        }
    }

    private async filterByStyle() {
        try {
            const sortFn = this.pickSort(this.style)
            const notes = this.notes.length
                ? this.notes
                : await this.allNotesFrontmatter()
            this.printList = notes
                .filter(this.filterBadDates)
                .filter(this.filterRecent.bind(this))
                .sort(sortFn)
                .map((note) => {
                    return `${formatDt(note.publish)}: ${note.title}`
                })
        } catch (error) {
            throw new Error(
                generateErrorMessage(
                    error,
                    `Failed to filter by style using ${this.style}`
                )
            )
        }
    }

    private preparePrintList() {
        this.printString =
            this.noteCount === 1
                ? this.printList[0]
                : this.noteCount > 1
                ? this.printList.slice(0, this.noteCount).join("\n")
                : this.printList.join("\n")
    }

    private print() {
        console.log(
            `The ${chalk.blue.bold(
                this.style
            )} published date and note matching the style ${
                this.noteCount === -1
                    ? `for all notes`
                    : `for ${this.noteCount} note${
                          this.noteCount !== 1 ? "s" : ""
                      }`
            } is:\n${chalk.bold(this.printString)}`
        )
    }

    private filterRecent(note: IFrontmatter) {
        return this.style === Published.Recent
            ? TODAY.isAfter(note.publish)
            : true
    }

    private filterBadDates(frontmatter: IFrontmatter) {
        return isValidDt(frontmatter.publish)
    }

    private pickSort(style: Published) {
        if (style === Published.First) {
            return (a: IFrontmatter, b: IFrontmatter) =>
                dayjs(b.publish).isAfter(dayjs(a.publish)) ? -1 : 1
        } else {
            return (a: IFrontmatter, b: IFrontmatter) =>
                dayjs(a.publish).isAfter(dayjs(b.publish)) ? -1 : 1
        }
    }
}
