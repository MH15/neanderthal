import * as fs from "fs-extra"
import * as path from "path"
import IResource from "./IResource"
import { readFile } from "./helpers/io"
const nunjucks = require("nunjucks")


export class Template implements IResource {
    path: string
    body: string
    constructor(path: string) {
        this.path = path
    }

    /**
     * Load the template to memory.
     */
    load(): Promise<Template> {
        return new Promise((resolve, reject) => {
            readFile(this.path, result => {
                this.body = result
                resolve(this)
            })
        })
    }

    /**
     * Render the loaded template with the given context.
     * @param data the nunjucks context
     */
    render(data): string {
        let html = nunjucks.renderString(this.body, data)
        return html
    }

    async write(path) {
        console.error("Honestly not sure what this function should do")
    }
}


export function loadTemplates(): Promise<Map<string, Template>> {
    return new Promise((resolve, reject) => {
        // Load all templates
        let templatesMap = new Map()
        let promises: Promise<Template>[] = []
        fs.readdir("templates", (err, templates) => {
            templates.forEach(template => {
                let templatePath = path.join("templates", template)
                if (fs.existsSync(templatePath)) {
                    let template = new Template(templatePath)
                    promises.push(template.load())
                }
            })
            Promise.all(promises).then((results) => {
                results.forEach(template => {
                    templatesMap.set(template.path, template)
                })
                resolve(templatesMap)
            }).catch(err => {
                console.error("Error loading templates:", err)
            })
        })
    })
}
