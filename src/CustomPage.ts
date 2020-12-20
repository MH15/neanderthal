import IResource from "./IResource"
import { Template } from "./Template"
import { writeFile, readFile, ioStats, readFileIfExists } from "./helpers/io"
const frontmatter = require("front-matter")
import * as fs from "fs-extra"
import { NunjucksRenderError, TempNunjucksRenderError } from "./helpers/exceptions"
import * as nunjucks from "nunjucks"
import MarkdownTag from "./helpers/nunjucks-extensions"
import Builder from "./Builder"
import validateFrontMatter from "./helpers/frontmatter"



export default class CustomPage implements IResource {
    path: string
    body: string

    attributes
    authors: string[] = []
    template: Template
    html: string
    name: string
    constructor(path: string, name: string, template: Template) {
        this.path = path
        this.name = name
        this.template = template
        this.html = null
    }

    load(): Promise<CustomPage> {
        return new Promise((resolve, reject) => {
            readFileIfExists(this.path).then(data => {

                let content = frontmatter(data)

                this.attributes = validateFrontMatter(content.attributes, this.path)
                this.body = content.body
                resolve(this)
            }).catch(err => {
                reject(err)
            })
        })
    }

    render(data): string {
        let innerHTML = ""
        try {
            innerHTML = Builder.nunjucks.renderString(this.body, {
                meta: data.meta || {}
            })
        } catch (err) {
            // console.log("errr", err)
            throw new NunjucksRenderError(err.name, err.lineno, err.colno)
        }

        this.html = this.template.render({
            title: this.attributes.title,
            page: innerHTML,
            meta: data.meta || {}
        })
        return this.html
    }

    async write(path) {
        if (this.html != null) {
            await writeFile(path, this.html)
        } else {
            console.error("Cannot write file that has not been rendered.")
        }
    }

    parseAuthors() {
        this.attributes.authors.forEach(username => {
            this.authors.push(username)
        })
    }
}