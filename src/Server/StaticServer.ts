import * as http from "http"
import * as url from "url"
import * as path from "path"
import * as fs from "fs"
import handler from "serve-handler"

export default class StaticServer {
    private directory: string
    private port: number
    private httpServer: http.Server
    constructor(directory: string, port?: number) {
        this.directory = directory
        this.port = port
        this.httpServer = http.createServer(this.handle.bind(this))
    }

    start() {
        try {
            this.httpServer.listen(this.port)
            console.log(`Server started on port ${this.port}.`)
        } catch (e) {
            console.error("Error opening server on port", this.port)
        }

    }

    stop() {
        this.httpServer.close()
    }

    handle(req: http.IncomingMessage, res: http.ServerResponse) {

        handler(req, res, {
            public: "build",
            trailingSlash: true
        })

    }
}