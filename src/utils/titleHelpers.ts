/**
 *
 * @param {string} markdownLink A link in the form of [title](link description)
 * @returns {array} An array with four elements: [whole match, title, link, description]
 */
// export function parseLink(markdownLink: string) {
//     const pattern: RegExp = new RegExp(
//         /^(?:\[(?<title>[^\]]*)?\]\(((?:https?)?[A-Za-z0-9\:\/\.\- ]+)(?:\"(.+)\")?\))/
//     )

//     const match = markdownLink.match(pattern)
//     const groups = match?.groups
//     return groups
// }

function parseLink(rowTitle: string) {
    const pattern = /^(?:\[(?<title>[^\]]*)?\]\((?<link>(?:https?)?[A-Za-z0-9\:\/\.\- ]+)(?:\"(?<description>.+)\")?\))/
    const match = rowTitle.match(pattern)

    const groups = match?.groups
    return groups
}

export default parseLink
