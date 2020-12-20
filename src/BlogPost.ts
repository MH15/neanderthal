import CustomPage from "./CustomPage"
import IResource from "./IResource"
import { Template } from "./Template"
import { writeFile, readFile, readFileIfExists } from "./helpers/io"
import { copy } from "fs-extra"
import { parse } from "path"
const frontmatter = require("front-matter")
import Builder from "./Builder"
import { FrontMatter } from "./helpers/types"
import validateFrontMatter from "./helpers/frontmatter"



export default class BlogPost implements IResource {
    path: string
    body: string

    attributes: FrontMatter | any
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
        this.attributes = {}
        return new Promise((resolve, reject) => {
            readFileIfExists(this.path).then(data => {
                // Parse frontmatter meta and markdown body from the file
                let content = frontmatter(data)

                this.attributes = validateFrontMatter(content.attributes, this.path)

                this.body = content.body

                this.parseAuthors()

                resolve(this)
            }).catch(err => {
                reject(err)
            })
        })
    }

    // TODO: render and load shouldn't be separate
    render(data): string {
        let markdown = Builder.md.render(this.body)

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
        // Copy all dependencies
        // TODO: do this better using the new v0.2.0 structure
        await copy(parse(this.path).dir, parse(path).dir, {
            filter: (src: string, dest: string): boolean => {
                return src !== this.path
            }
        })

        // Write rendered HTML
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


