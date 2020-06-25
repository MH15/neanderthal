import watch from "node-watch"
import { join, relative } from "path"
import CommandLine from "./CommandLine"
import { RenderTypes } from "./helpers/types"
import Builder from "./Builder"
import BlogPost from "./BlogPost"
import { makeDir } from "./helpers/io"
var StaticServer = require('static-server')


// Parse command line args
let root = new CommandLine(false, build, serve)



// Build

async function build(cli) {
    // console.log("build", cli)
    // TODO: trigger full build
    let builder = new Builder(cli.nconfig)
    await builder.setup()
    await builder.build()

}

async function serve(cli) {
    console.log("serve")
    // Trigger full initial build
    // build(cli)
    let builder = new Builder(cli.nconfig)
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
        if (name.startsWith(dirPosts)) {
            // Locate the blog post
            let possiblePath = relative(process.cwd(), name)

            let post: BlogPost = null
            if (builder.posts.has(possiblePath)) {
                post = builder.posts.get(possiblePath)
            } else {
                // If the post is not loaded in the Builder, create a new BlogPost object
                post = new BlogPost(possiblePath, "new-post", builder.templates.get("templates/post.njk"))
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
            // Render this custom page
            // TODO


            let relativePath = relative(process.cwd(), name)
            cli.log(relativePath, join("build", relativePath), RenderTypes.Render)
        } else if (name.startsWith(dirPublic)) {
            let relativePath = relative(process.cwd(), name)
            cli.log(relativePath, join("build", relativePath), RenderTypes.Copy)
        }

        // TODO: log every time an update happens
    })

    var server = new StaticServer({
        rootPath: dirBuild,            // required, the root of the server file tree
        port: 9080,               // required, the port to listen
        name: 'my-http-server',   // optional, will set "X-Powered-by" HTTP header
        cors: '*',                // optional, defaults to undefined
        // followSymlink: true,      // optional, defaults to a 404 error
        // templates: {
        //     index: 'foo.html',      // optional, defaults to 'index.html'
        //     notFound: '404.html'    // optional, defaults to undefined
        // }
    })



    server.start(() => {
        console.log("Dev server started")
    })

    server.on('request', function (req, res) {
        // req.path is the URL resource (file name) from server.rootPath
        // req.elapsedTime returns a string of the request's elapsed time
        console.log(req.url)
        console.log(res.body)
    })
}