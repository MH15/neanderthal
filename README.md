# [neanderthal](https://github.com/mh15/neanderthal)

A static hypertext generator for your blog or website. 

[![NPM version](https://img.shields.io/npm/v/neanderthal)](https://www.npmjs.com/package/neanderthal)
[![NPM downloads](https://img.shields.io/npm/dt/neanderthal)](https://www.npmjs.com/package/neanderthal)
[![GitHub](https://img.shields.io/github/license/mh15/neanderthal)](https://github.com/MH15/neanderthal/blob/master/LICENSE)
[![Join the chat at
https://gitter.im/neanderthal-static-sites/community](https://badges.gitter.im/neanderthal-static-sites/community.svg)](https://gitter.im/neanderthal-static-sites/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Overview

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
- Incremental builds.

## Getting Started
The best-practice way to use Neanderthal is with
[npx](https://blog.npmjs.org/post/162869356040/introducing-npx-an-npm-package-runner).
This will ensure you always use the current stable release. Running the below
command to cache the current version of Neanderthal and set up a new project:
```bash
npx neanderthal
```

To serve the blog on a dev server with incremental builds, run:
```bash
npx neanderthal --serve
```

It's recommended to lock the version of Neanderthal you are using to your
`package.json` file by calling
```bash
npm install --save-dev neanderthal
```
Now `npx` will run your project's cached installation of Neanderthal without polluting the global scope.


# Documentation
The docs for neanderthal should always fit in this Github Readme.

## Making a blog post
1. Open the `posts/` directory in your neanderthal project. 
2. Create a new folder
with the URL for your post, e.g. "learning-git". 
3. Add an `index.md` file with the
content from [posts/template/index.md](/posts/template/index.md).
4. Edit the frontmatter (the stuff between the dashed lines) to customize
   metadata for your post, then edit the markdown body.

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

## Help

If our [docs](#documentation) don't suffice, check
the [troubleshooting](#troubleshooting) section or ask for help on our
[Gitter](https://gitter.im/neanderthal-static-sites/community). If you find a
verifiable bug, please file an issue.


## Contributing
We are looking for your help to make Neanderthal better!
There is a general [Roadmap](https://github.com/mh15/neanderthal/Roadmap.md) for
project, but feel free to open issues with new feature proposals.

## Code of Conduct
TODO



## Credits
This project would not exist without the following fantastic libraries:
- [new.css](https://newcss.net/) - new.css is a classless CSS framework to write modern websites using only HTML.
- [ansi-colors](https://www.npmjs.com/package/ansi-colors) - the fastest Node.js
  library for terminal styling
- [front-matter](https://www.npmjs.com/package/front-matter) - extract meta data
  (front-matter) from documents.
- [fs-extra](https://www.npmjs.com/package/fs-extra) - adds file system methods
  that aren't included in the native `fs` module
- [nunjucks](https://www.npmjs.com/package/nunjucks) - fully featured templating
  engine for javascript, inspired by
  [jinja2](https://jinja.palletsprojects.com/en/2.11.x/)
- [static-server](https://www.npmjs.com/package/static-server) - a simple http
  server to serve static resource files from a local directory
- [terminal-link](https://www.npmjs.com/package/terminal-link) - create
  clickable links in the terminal
- [yesno](https://www.npmjs.com/package/yesno) - a nodejs library for issuing
  and handling responses to yes/no questions
- [typescript](https://www.typescriptlang.org/) - a superset of JavaScript, adds
  optional types to JavaScript