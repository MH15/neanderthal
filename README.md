# [neanderthal](https://github.com/mh15/neanderthal)

A static hypertext generator for your blog or website. 

[![Join the chat at https://gitter.im/neanderthal-static-sites/community](https://badges.gitter.im/neanderthal-static-sites/community.svg)](https://gitter.im/neanderthal-static-sites/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Overview.

Neanderthal transpiles structured Markdown and Nunjucks content to a static
blog, with support for custom pages, tagged posts, and authors. You can write
posts in Markdown with front matter metadata, then customize the Nunjucks
templates as needed.

### Features
- Blog posts with support for multiple authors.
- A full tagging system.
- Author profile pages.
- Custom pages.
- Full support of the CommonMark Markdown spec, thanks to [marked](https://marked.js.org).
- The power of [Nunjucks](https://mozilla.github.io/nunjucks/) templates.

### Roadmap
These features should be added in an upcoming release
- Support for nested custom pages
- More configuration options

## Getting Started

* [Install](https://jekyllrb.com/docs/installation/) the gem
* Read up about its [Usage](https://jekyllrb.com/docs/usage/) and [Configuration](https://jekyllrb.com/docs/configuration/)
* Take a gander at some existing [Sites](https://github.com/jekyll/jekyll/wiki/sites)
* [Fork](https://github.com/jekyll/jekyll/fork) and [Contribute](https://jekyllrb.com/docs/contributing/) your own modifications
* Have questions? Check out our official forum community [Jekyll Talk](https://talk.jekyllrb.com/) or [`#jekyll` on irc.freenode.net](https://botbot.me/freenode/jekyll/)

# Documentation
The docs for neanderthal should always fit in this Github Readme.

## Configuration ([`nconfig.js`](/nconfig.js))
Often the first file to edit, the more information you can store in here the
simpler your development process will be. 

### `meta`
The `meta` object is sent to every
Nunjucks template rendered in your site. You can add any information to this
object you may need, such as the site name and organization.

### `authors`
You must choose a unique URL as the key for each author in the `authors` object.
An author object must contain `name`,`short_bio` and `bio` fields but may
contain any additional data. Common examples would be social media URLs that can
be displayed in the `author.njk` template. Remember: any additional information
passed into an author object is not rendered by default. You will need to access
the data in the respective template.

### `config`
The `config` object controls the build process. **TODO**.



## Templating
Neanderthal uses the wonderful [Nunjucks](https://mozilla.github.io/nunjucks/)
templating system. Nunjucks is a Mozilla project designed to bring python's
[Jinja](https://jinja.palletsprojects.com/en/2.11.x/) templating system to
JavaScript. You can read the detailed Nunjucks [templating
documentation](https://mozilla.github.io/nunjucks/templating.html) for more
info.


# Addendum

## Finding Help

If our [docs](#documentation) don't suffice, check
the [troubleshooting](#troubleshooting) section or ask for help on our
[Gitter](https://gitter.im/neanderthal-static-sites/community). If you find a
verifiable bug, please file an issue.

## Code of Conduct
TODO






Run `npm build` to trigger the build script.

The build script does the following:
1. Delete then create the `build` directory.
2. Create `build/blog`.
3. From the root `blog` directory, parse every folder as its own post, using the “post” template from `templates/post.html`.
    1. Create a new directory as `build/blog/{post-name}`
    2. Copy all static assets (images, etc) into the directory.
    3. Render markdown and hydrate the template.
    4. Write rendered html to `build/blog/{post-name}/index.html`
4. From the root `pages` directory, parse every folder as its own page, using the “page” template from `templates/page.html`.
    1. Check to make sure the page name does not conflict with “blog”
    2. Create a new directory as `build/{page-name}`
    3. Copy all static assets (images, etc) into the directory.
    4. If the index at `pages/{page-name}` is a markdown file, render markdown then hydrate the template.
    5. If the index at `pages/{page-name}` is an html file, just hydrate the template.
    6. Write rendered html to `build/{page-name}/index.html`
5. Copy all files from `labs` to `build/labs`. Labs are raw html5 for posting projects outside the blog structure.
6. Copy `pages/index.html` from the pages directory to `build/index.html`. This is the homepage of the app.


## Credits
- [new.css](https://newcss.net/) - new.css is a classless CSS framework to write modern websites using only HTML.
- 