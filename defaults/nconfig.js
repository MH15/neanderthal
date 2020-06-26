/**
 * Project config for your site.
 * All variables declared in `meta` will be accessible in your Nunjucks
 * templates. Variables changed in `config` affect the build process.
 *
 */
module.exports = {
    // The `meta` object is sent to every template.
    meta: {
        title: "Site Title",
        description: "This blog is statically awesome!",
        author: "Matt Hall",
    },
    // All authors must be defined here.
    authors: {
        "first-author": {
            name: "First Author",
            short_bio: "short bio catchphrase",
            bio: "a whole HTML paragraph."
        },
        "second-author": {
            name: "Second Author",
            short_bio: "a short bio.",
            bio: "a whole HTML paragraph."
        }
    },
    config: {

    },
}