const matter = require("gray-matter")
const fs = require("fs")
const path = require("path")

// This is a test to figure out how Matter will parse a document -- though it only focuses on frontmatter

const data = fs.readFileSync(path.resolve(__dirname, "../test/example.md"), {
    encoding: "utf8",
})
console.log(data)
console.log(matter(data))
