import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

export function isValidDt(date: string) {
    return date && dayjs(date).isValid()
}

export function formatDt(date: string, format?: string) {
    return dayjs(date).utc().format(format)
}
