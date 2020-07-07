# Neanderthal Project Changelog
# Changelog
All notable changes to this project will be documented in this file, as
published to NPM.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


# 0.1.11
Updated Markdown renderer, draft posts.
- Changelog added.
- Markdown renderer changed to [`markdown-it`](https://github.com/markdown-it/markdown-it).
- Footnote support added using [`markdown-it-footnote`](https://github.com/markdown-it/markdown-it-footnote)
- Primitive support for **draft posts** added. Frontmatter YAML field `draft: true` will ensure draft posts are not rendered or published.
