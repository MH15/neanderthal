import BlogPost from "./BlogPost"
import CustomPage from "./CustomPage"
import Author from "./Author"
import { Template, loadTemplates } from "./Template"
import IResource from "./IResource"
import { join } from "path"
import { isDir, makeDir, writeFile, deleteDir } from "./helpers/io"
import { readdir, readFileSync, copy } from "fs-extra"
import vars from "./helpers/vars"
import CommandLine from "./CommandLine"
const nunjucks = require("nunjucks")

export default class Builder {
    posts: Map<string, BlogPost>
    pages: Map<string, CustomPage>
    tags: Map<string, BlogPost[]>
    authors: Map<string, Author>
    templates: Map<string, Template>
    nconfig

    cli: CommandLine

    dirPosts = join(process.cwd(), "posts")
    dirPages = join(process.cwd(), "pages")
    dirBuild = join(process.cwd(), vars.BUILD)

    constructor(cli: CommandLine) {
        this.nconfig = cli.nconfig
        this.cli = cli
    }

    async setup() {
        this.templates = await loadTemplates()
        this.authors = this.nconfig.authors // this won't autoreload, think about this more
    }

    clean() {
        // Delete then create the `build` directory
        deleteDir("build")
        makeDir("build")

    }

    renderBlogPosts() {
        this.posts.forEach((post, key, map) => {
            let postPath = join("build", "blog", post.name)
            makeDir(postPath)
            let buildPath = join(postPath, "index.html")
            post.render({
                meta: this.nconfig.meta
            })
            post.write(buildPath)
        })
    }

    async loadAndRenderOneBlogPost(post: BlogPost): Promise<string> {
        await post.load()
        let postBuildDir = join(this.dirBuild, "blog", post.name)
        makeDir(postBuildDir)
        let postBuildFile = join(postBuildDir, "index.html")
        post.render({
            meta: this.nconfig.meta
        })
        await post.write(postBuildFile)
        // console.log(result)
        return postBuildFile
    }

    async loadAndRenderOneCustomPage(page: CustomPage): Promise<string> {
        await page.load()
        let pageBuildDir = join(this.dirBuild, page.name)
        makeDir(pageBuildDir)
        let pageBuildFile = join(pageBuildDir, "index.html")
        page.render({
            meta: this.nconfig.meta
        })
        await page.write(pageBuildFile)
        // console.log(result)
        return pageBuildFile
    }

    async renderBlogIndex() {
        let orderedPosts = Array.from(this.posts.values())
        orderedPosts.sort(compareDatePublished)
        // Generate the root blog page as a list of recent posts by date
        let html = this.templates.get(join(vars.TEMPLATES, "blog.njk")).render({
            blog_posts: orderedPosts,
            meta: this.nconfig.meta,
            title: "Blog"
        })
        writeFile(join(this.dirBuild, vars.BLOG, "index.html"), html)
    }

    async build() {
        this.clean()
        // Create `build/blog`
        makeDir("build/blog")
        // The Map of BlogPosts is used by a lot of things so we'll await that
        this.posts = await this.loadBlogPosts()

        // No need to wait for the completion of this write
        this.renderBlogPosts()

        // for every blog post, add it to a map where the key is
        // the tag and the value is an array of posts with that tag.
        this.renderTagsPage()

        // Sort posts by most recent
        this.renderBlogIndex()

        // Create pages for each author defined in `nconfig.js` using the "author" template
        makeDir("build/author")
        Object.keys(this.nconfig.authors).forEach(async (username) => {
            let author = this.nconfig.authors[username]
            let html = this.templates.get(join(vars.TEMPLATES, "author.njk")).render({
                author,
                title: author.name
            })
            await writeFile(join(this.dirBuild, vars.AUTHORS, username, "index.html"), html)
        })

        // From the root `pages` directory, parse every folder as its own page, using the “page” template from `templates/page.njk`.
        this.pages = await this.loadPages()
        // No need to wait for the completion of this write
        this.pages.forEach((page, name, map) => {
            let postPath = join("build", page.name)
            makeDir(postPath)
            let buildPath = join(postPath, "index.html")
            page.render({
                meta: this.nconfig.meta
            })
            page.write(buildPath)
        })

        // Render `pages/index.njk` from the pages directory to `build/index.html`.
        // This is the homepage of the app.
        let indexPath = join(this.dirPages, "index.njk")
        let content = readFileSync(join(this.dirPages, "index.njk"), "utf8")
        let html = nunjucks.renderString(content, {
            meta: this.nconfig.meta,
            title: "Home"
        })
        writeFile(join(this.dirBuild, "index.html"), html)

        // Copy all files from `public` to `build/public`. Public files are css, js,
        // etc that can be referenced from anywhere under the `public` route.
        copy(join("public"), join("build", "public")).catch(err => {
            console.error(err)
        })

        // Copy all files from `labs` to `build/labs`. Labs are raw html5 for 
        // posting projects outside the blog structure.
        await copy(join("labs"), join("build", "labs"))


    }
    renderTagsPage() {
        this.tags = new Map<string, BlogPost[]>()
        this.posts.forEach(post => {
            let tags = post.attributes.tags || []
            for (let tag of tags) {
                if (this.tags.has(tag)) {
                    let posts = this.tags.get(tag)
                    posts.push(post)
                    this.tags.set(tag, posts)
                } else {
                    this.tags.set(tag, [post])
                }
            }
        })

        // Create pages for every tag mentioned in a post
        makeDir("build/tags")
        let tags = Array.from(this.tags.keys())
        for (let tag of tags) {
            let html = this.templates.get(join(vars.TEMPLATES, "tag.njk")).render({
                tag,
                blog_posts: this.tags.get(tag),
                meta: this.nconfig.meta,
                title: `"${tag}" tag`
            })
            writeFile(join(this.dirBuild, vars.TAGS, tag, "index.html"), html)
        }
    }

    async write(resource: IResource, path: string) {
        resource.write(path)
    }

    async loadBlogPosts(): Promise<Map<string, BlogPost>> {
        return new Promise((resolve, reject) => {
            readdir(this.dirPosts, (err, folders) => {
                if (err) reject(err)

                let template = this.templates.get(join(vars.TEMPLATES, "post.njk"))
                // Load all blog posts concurrently but wait until they are all
                // loaded before resolving the Promise.
                Promise.all(folders.map(async folder => {
                    let folderPath = join(vars.POSTS, folder)
                    if (isDir(folderPath)) {
                        let postPath = join(this.dirBuild, "blog", folder)
                        let indexPath = join(folderPath, "index.md")
                        let blogPost = new BlogPost(indexPath, folder, template)
                        await blogPost.load()
                        return blogPost
                    }
                })).then(posts => {
                    let blog_posts = new Map<string, BlogPost>()
                    for (let post of posts) {
                        blog_posts.set(post.path, post)
                    }
                    resolve(blog_posts)
                }).catch(err => {
                    console.error(err)
                    reject(err)
                })

            })
        })
    }

    async loadPages(): Promise<Map<string, CustomPage>> {
        return new Promise((resolve, reject) => {
            readdir(this.dirPages, (err, folders) => {
                if (err) reject(err)

                let template = this.templates.get(join(vars.TEMPLATES, "page.njk"))
                // Load all blog posts concurrently but wait until they are all
                // loaded before resolving the Promise.
                Promise.all(folders.map(async folder => {
                    let folderPath = join(vars.PAGES, folder)
                    if (isDir(folderPath)) {
                        let indexPath = join(folderPath, "index.njk")
                        let page = new CustomPage(indexPath, folder, template)
                        try {
                            await page.load()
                        } catch (err) {
                            this.cli.error(err)
                        }
                        return page
                    }
                })).then(pages => {
                    let customPages = new Map<string, CustomPage>()
                    // console.log("PAGES", pages.length, pages)
                    for (let page of pages) {
                        // console.log("PAGE", page.name)
                        if (page) {
                            customPages.set(page.path, page)
                        }
                    }
                    resolve(customPages)
                }).catch(err => {
                    console.error(err)
                    reject(err)
                })

            })
        })
    }

}



function compareDatePublished(a: BlogPost, b: BlogPost) {
    let dateA = new Date(a.attributes.date_published)
    let dateB = new Date(b.attributes.date_published)
    return dateB.getTime() - dateA.getTime()
}