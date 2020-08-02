import dayjs from "dayjs"

export function validateDt(date: string, format: string = "YYYY-MM-DD") {
    return dayjs(date, format).format(format) === date
}
