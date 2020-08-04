
import markdownIt from "markdown-it"
import nunjucks from "nunjucks"


// Inspired by https://github.com/zephraph/nunjucks-markdown/
export default function MarkdownTag(md: markdownIt) {
    this.tags = ["markdown"]
    this.parse = function (parser, nodes, lexer) {
        // get the tag token
        let tok = parser.nextToken()

        // parse the args and move after the block end. passing true
        // as the second arg is required if there are no parentheses
        let args = parser.parseSignature(null, true)
        parser.advanceAfterBlockEnd(tok.value)

        // If arguments, return the fileTag constructed node
        // if (args.children.length > 0)
        // return new nodes.CallExtension(this, 'fileTag', args)

        // Otherwise parse until the close block and move the parser to the next position
        var body = parser.parseUntilBlocks('endmarkdown')

        // I found Nunjucks  to be incredibly convoluted on how to just get some data into the BlockTag function,
        // this finally worked by faking another template node.
        var tabStart = new nodes.NodeList(0, 0, [new nodes.Output(0, 0, [new nodes.TemplateData(0, 0, (tok.colno - 1))])])

        parser.advanceAfterBlockEnd()

        // Return the constructed blockTag node
        return new nodes.CallExtension(this, 'blockTag', args, [body, tabStart])
    }

    this.blockTag = function (context, body, tabStart) {
        var body = body()
        var spacesRegex = /^[\s]+/
        var tabStart = tabStart() // The column postion of the {% markdown %} tag.

        if (tabStart > 0) { // If the {% markdown %} tag is tabbed in, normalize the content to the same depth.
            body = body.split(/\r?\n/) // Split into lines.
            body = body.map(function (line) {
                var startSpaces = line.match(spacesRegex)
                if (startSpaces && startSpaces[0].length >= tabStart) { // If the content is not at the same or greater tab depth, do nothing..
                    return line.slice(tabStart) // Subtract the column postion from the start of the string.
                } else if (startSpaces) {
                    return line.slice(startSpaces[0].length)
                } else {
                    return line
                }
            })
            body = body.join("\n") // Rejoin into one string.
        }

        return new nunjucks.runtime.SafeString(md.render(body))
    }


}