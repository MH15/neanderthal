import CommandLine from "./CommandLine"
import { join } from "path"


// Parse command line args
let cli = new CommandLine(false, () => {
    // try a load a config file
    try {
        let nconfig = require(join(process.cwd(), "nconfig.js"))
        build()
        cli.showBuildStats()

    } catch (e) {
        cli.showOnboarding()

    }
})








// Build

function build() {

}