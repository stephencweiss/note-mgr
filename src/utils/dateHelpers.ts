import dayjs from "dayjs"

export function isValidDt(date: string) {
    return dayjs(date).isValid()
}

export function formatDt(date: string, format?: string) {
    return dayjs(date).format(format)
}
