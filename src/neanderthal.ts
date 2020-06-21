import CommandLine from "./CommandLine"
import { join, relative } from "path"
import watch from "node-watch"
import { RenderTypes } from "./Types"
var StaticServer = require('static-server')


// Parse command line args
let cli = new CommandLine(false, build, serve)



// Build

function build() {
    console.log("build")
    // TODO: trigger full build


}
function serve() {
    console.log("serve")
    // Trigger full initial build
    build()



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
    watch([dirPosts, dirPages, dirPublic], { recursive: true }, (evt, name) => {
        if (name.startsWith(dirPosts)) {
            // Render this blog post
            // TODO

            // Render blog index page
            // TODO

            // Render tags page
            // TODO
            let relativePath = relative(process.cwd(), name)
            cli.log(relativePath, join("build", relativePath), RenderTypes.Render)
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
}