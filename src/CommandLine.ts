import * as c from "ansi-colors"
import { existsSync, copy } from "fs-extra"
import { join } from "path"
import * as terminalLink from "terminal-link"
import * as yesno from 'yesno'
import { readFile, writeFile } from "./helpers/io"
import { RenderTypes } from "./helpers/types"
/**
 * Calling `npx neanderthal` should build your directory, operating in the following steps.
 * 1. Check for an nconfig.json. If that file does not exist:
 *      a. Warn the user that anything in `build` will be overwritten
 *      b. Prompt the use to make sure they want to use the tool.
 *      c. If they say yes, create a nconfig.json with smart defaults and all other directories from template.
 *      d. Display link to documentation.
 * 2. If nconfig.json exists, build the site entirely. Log ioStats.

 * Calling `npx neanderthal --serve` should build your directory, then serve and incrementally build on watched changes.

 * Calling `npx neanderthal --help` should display help.
 */
export default class CommandLine {
    args: string[]
    cwd: string
    showMessage: boolean
    nconfig
    constructor(showMessage, buildCallback, serveCallback) {
        this.args = process.argv.slice(2)
        this.cwd = process.cwd()
        this.showMessage = showMessage



        // Check if a config file exists, if not show onboarding
        if (existsSync(join(this.cwd, "nconfig.js"))) {
            this.nconfig = require(join(this.cwd, "nconfig.js"))
            // Do normal build or check parameters
            if (this.args.length > 0) {
                switch (this.args[0]) {
                    case '-s':
                    case '--serve':
                        serveCallback(this)
                        break
                    case '-h':
                    case '--help':
                        this.showHelp()
                        break
                    case '-v':
                    case '--version':
                        this.showVersion()
                        break

                }
            } else {
                buildCallback(this)
            }
        } else {
            this.showOnboarding()
        }


    }

    async showOnboarding() {
        console.log(c.bold.cyan("Welcome to Neanderthal!"))
        console.log("This appears to be the first time you've used Neanderthal in this directory, so let's get things set up.")
        const addConfigFile = await yesno({
            question: 'Add an `nconfig.json` file with default configuration options? (Y/n)',
            defaultValue: true
        })
        if (addConfigFile) {
            let defaultConfig = readFile(join(__dirname, "..", "defaults", "nconfig.js"), (content) => {
                writeFile(join(this.cwd, "nconfig.js"), content)
            })
        }
        const addDirectories = await yesno({
            question: 'Add sample directories? (Y/n)',
            defaultValue: true
        })
        if (addDirectories) {
            let defaults = join(__dirname, "..", "defaults")
            console.log(this.cwd)
            await copy(join(defaults, "posts"), join(this.cwd, "posts"))
            await copy(join(defaults, "pages"), join(this.cwd, "pages"))
            await copy(join(defaults, "templates"), join(this.cwd, "templates"))
            await copy(join(defaults, "public"), join(this.cwd, "public"))
            await copy(join(defaults, "labs"), join(this.cwd, "labs"))

        }

        console.log(c.green(`You're all set up!`))
        console.log(c.green(`Run ${c.bold("npx neanderthal")} to build your site or run ${c.bold("npx neanderthal --serve")} to start a dev server.`))
        console.log(c.cyan(`Check out the ${terminalLink("docs", "https://github.com/mh15/neanderthal")} to get started on your site.`))

        this.exit()
    }

    showBuildStats() {
        throw new Error("Method not implemented.")
    }

    showHelp() {
        console.log("Usage: npx neanderthal [options]")
        console.log("   or: neanderthal [options]")
        console.log("Options: ")
        for (let option of options) {
            let row = `  -${option.short}, --${option.long}`.padEnd(28)
            row += option.help
            console.log(row)
        }
        console.log("When no options are included, a full build is performed.")
        console.log(c.cyan(`Visit the ${terminalLink("docs", "https://github.com/mh15/neanderthal")} for more information.`))

    }

    showVersion() {
        let version = require(join(__dirname, "..", "package.json")).version
        console.log(version)
    }

    log(type: RenderTypes, destination: string, source?: string) {
        switch (type) {
            case RenderTypes.Copy:
                console.log(`${c.bold.green("Copied")} ${source} to ${destination}.`)
                break
            case RenderTypes.Render:
                console.log(`${c.bold.cyan("Rendered")} ${source} to ${destination}.`)
                break
            case RenderTypes.Generated:
                console.log(`${c.bold.magenta("Generated")} ${destination}.`)
        }
    }

    exit() {
        if (this.showMessage) {
            console.log(c.magenta("Message from creator"))
        }
    }

}


let options = [
    {
        short: "v",
        long: "version",
        help: "print Neanderthal version"
    },
    {
        short: "h",
        long: "help",
        help: "print Neanderthal help"
    },
    {
        short: "s",
        long: "serve",
        help: "start dev server with incremental builds"
    }
]