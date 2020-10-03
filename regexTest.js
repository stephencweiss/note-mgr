const parseLink = require("./dist/utils/titleHelpers")

function parseTitle(rowTitle) {
    const pattern = /^(?:\[(?<title>[^\]]*)?\]\((?<link>(?:https?)?[A-Za-z0-9\:\/\.\- ]+)(?:\"(?<description>.+)\")?\))/

    const match = rowTitle.match(pattern)
    const groups = match.groups
    return groups
}

const title = "[Regex](regex-grouping-matches)"

const js = parseTitle(title)
const parsed = parseLink(title)
console.log(`link (ts version): `, parsed)
console.log(`title: `, parseTitle(title))
