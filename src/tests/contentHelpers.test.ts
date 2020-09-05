import { Content } from "../utils"

function main() {
    const content = new Content()
    const { headers, divider, body } = content.read()
    // files.forEach((file) => console.log(file))
    console.log({ headers, divider, body })
}

console.log(main())
