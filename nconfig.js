/**
 * Project config for your site.
 * All variables declared in `meta` will be accessible in your Nunjucks
 * templates. Variables changed in `config` affect the build process.
 *
 */
module.exports = {
    meta: {
        title: "Site Title",
        description: "This blog is statically awesome!",
        author: "Matt Hall",
    },
    config: {

    },
    authors: {
        "peter-hall": {
            name: "Peter Hall",
            short_bio: "short bio catchphrase",
            bio: "a whole fucking paragraph."
        },
        "deklin-caban": {
            name: "Deklin Caban",
            short_bio: "and I yeet.",
            bio: "a whole fucking paragraph."
        }
    }
}