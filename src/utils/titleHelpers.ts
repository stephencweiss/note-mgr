/**
 * @param {string} markdownLink A link in the form of [title](link description)
 * @returns {array} An array with four elements: [whole match, title, link, description]
 * TODO: Update to return an object with named capture groups
 */
export function parseLink(markdownLink: string) {
    const pattern = /^(?:\[([^\]]*)?\]\(([A-Za-z0-9\:\/\.\- ]+)(?:\"(.+)\")?\))/
    const match = markdownLink.match(pattern)
    return match || []
}
