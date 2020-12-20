import { CLIENT_RENEG_LIMIT } from "tls"
import CommandLine from "../CommandLine"
import { FrontMatterFieldNotFound } from "./exceptions"
import { FrontMatter } from "./types"

declare let CLI: CommandLine

export default function validateFrontMatter(source: any, file:string):FrontMatter {
    if(source.title == undefined) {
        CLI.warn(new FrontMatterFieldNotFound("title", file))
        // CLI.warn(err)
    }

    // @ts-ignore
    return source;
}