import CustomPage from "./CustomPage"
import IResource from "./IResource"
import { Template } from "./Template"
import { writeFile, readFile, readFileIfExists } from "./helpers/io"
const frontmatter = require("front-matter")
const marked = require("marked")


export default class BlogPost implements IResource {
    path: string
    body: string

    attributes
    authors = []
    template: Template
    html: string
    name: string
    constructor(path: string, name: string, template: Template) {
        this.path = path
        this.name = name
        if (template != null) {
            this.template = template
        } else {
            throw new Error("Template does not exist.")
        }
        this.html = null
    }

    load(): Promise<BlogPost> {
        this.authors = []
        this.attributes = []
        return new Promise((resolve, reject) => {
            readFileIfExists(this.path).then(data => {
                // Parse frontmatter meta and markdown body from the file
                let content = frontmatter(data)
                this.attributes = content.attributes
                this.body = content.body

                this.parseAuthors()

                resolve(this)
            }).catch(err => {
                reject(err)
            })
        })
    }

    render(data): string {
        let markdown = marked(this.body)

        this.html = this.template.render({
            markdown: markdown,
            title: this.attributes.title,
            authors: this.authors || [],
            attributes: this.attributes,
            meta: data.meta || {}
        })
        return this.html
    }

    async write(path) {
        if (this.html != null) {
            return await writeFile(path, this.html)
        } else {
            console.error("Cannot write file that has not been rendered.")
        }
    }

    parseAuthors() {
        // TODO: integrate nconfig author fields and Author class
        if (this.attributes.authors) {
            this.attributes.authors.forEach(username => {
                this.authors.push({
                    username: username,
                    name: username
                    // name: this.nconfig.authors[author].name || "No Author"
                })
            })
        }
    }
}