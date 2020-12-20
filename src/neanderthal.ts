import watch from "node-watch"
import { join, relative, parse } from "path"
import CommandLine from "./CommandLine"
import { RenderTypes } from "./helpers/types"
import Builder from "./Builder"
import BlogPost from "./BlogPost"
import { makeDir, isFile } from "./helpers/io"
import CustomPage from "./CustomPage"
import StaticServer from "./Server/StaticServer"


declare var CLI: CommandLine

// Parse command line args
var CLI = new CommandLine(false, build, serve)

globalThis.CLI = CLI

// Build
async function build(cli) {
    // console.log("build", cli)
    // TODO: trigger full build
    let builder = new Builder(cli)
    await builder.setup()
    await builder.build()

}

async function serve(cli) {
    // Trigger full initial build
    // build(cli)
    let builder = new Builder(cli)
    await builder.setup()
    await builder.build()


    // Watch for post changes
    let dirPosts = join(process.cwd(), "posts")

    // Watch for custom page changes
    let dirPages = join(process.cwd(), "pages")

    // Watch for public changes
    let dirPublic = join(process.cwd(), "public")

    // Save to output dir
    let dirBuild = join(process.cwd(), "build")

    /**
     * Start incremental build process
     * Basically- watch for changes in source directories then
     * on change build the new files and those that depend on them
     * like blog index and tag index pages, then overwrite just
     * those files in the build folder.
     * 
     * TODO: support live reload for templates, this might be more complicated
     */
    watch([dirPosts, dirPages, dirPublic], { recursive: true }, async (evt, name) => {
        // Only process events on files
        if (!isFile(name)) {
            return
        }

        // Catch the index page, it is handled seperately
        if (name == join(dirPages, "index.njk")) {
            builder.renderIndexPage()
            let relativeOutPath = relative(process.cwd(), join(dirBuild, "blog", "index.html"))
            cli.log(RenderTypes.Generated, relativeOutPath)
            return
        }

        if (name.startsWith(dirPosts)) {
            // Locate the blog post
            let possiblePath = relative(process.cwd(), name)

            let post: BlogPost = null
            if (builder.posts.has(possiblePath)) {
                post = builder.posts.get(possiblePath)
            } else {
                // If the post is not loaded in the Builder, create a new BlogPost object
                let relativeNamePath = relative(dirPosts, parse(possiblePath).dir)
                post = new BlogPost(possiblePath, relativeNamePath, builder.templates.get("templates/post.njk"))
                builder.posts.set(post.path, post)
            }

            // Render this blog post
            let outPath = await builder.loadAndRenderOneBlogPost(post)
            let relativeInPath = relative(process.cwd(), name)
            let relativeOutPath = relative(process.cwd(), outPath)
            cli.log(RenderTypes.Render, relativeOutPath, relativeInPath)

            // Render blog index page
            await builder.renderBlogIndex()
            relativeOutPath = relative(process.cwd(), join(dirBuild, "blog", "index.html"))
            cli.log(RenderTypes.Generated, relativeOutPath)

            // Render tags page
            builder.renderTagsPage()
            relativeOutPath = relative(process.cwd(), join(dirBuild, "tags"))
            cli.log(RenderTypes.Generated, relativeOutPath)
        } else if (name.startsWith(dirPages)) {
            // Locate the custom page
            let possiblePath = relative(process.cwd(), name)

            let page: CustomPage = null
            if (builder.pages.has(possiblePath)) {
                page = builder.pages.get(possiblePath)
            } else {
                // If the post is not loaded in the Builder, create a new BlogPost object
                let relativeNamePath = relative(dirPages, parse(possiblePath).dir)
                page = new CustomPage(possiblePath, relativeNamePath, builder.templates.get("templates/page.njk"))
                builder.pages.set(page.path, page)
            }

            // Render this blog post
            let outPath = await builder.loadAndRenderOneCustomPage(page)
            let relativeInPath = relative(process.cwd(), name)
            let relativeOutPath = relative(process.cwd(), outPath)
            cli.log(RenderTypes.Render, relativeOutPath, relativeInPath)


            let relativePath = relative(process.cwd(), name)
            cli.log(relativePath, join("build", relativePath), RenderTypes.Render)
        } else if (name.startsWith(dirPublic)) {
            builder.copyPublic()
            let relativePath = relative(process.cwd(), name)
            cli.log(relativePath, join("build", relativePath), RenderTypes.Copy)
        }


        // TODO: log every time an update happens
    })

    let server = new StaticServer(dirBuild, 9080)
    server.start()

}