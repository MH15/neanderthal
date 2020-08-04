# Neanderthal Project Changelog
All notable changes to this project will be documented in this file, as
published to NPM.

This project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

# Future [unassigned]
Features we hope to implement soon. Contributions welcome!
- [ ] Hot reloading the browser on build.
- [ ] Versioned posts.
- [ ] Support for themes built around a standard interface.
- [ ] Support other templating engines for posts and pages. Maybe even JSX/MDX?
- [ ] Improvements to Frontmatter processing
  - [ ] Internal type safety
  - [ ] User-facing errors and warnings

# 0.1.12
Polishing user experience for alpha release.
- [x] Prerendered markdown syntax highlighting.
- [x] Added `{% markdown %}` tag in Nunjucks templates.
- [x] Error handling in Nunjucks templates.
- [x] Improve render pipeline.
- [x] Documentation updates to support new features.


# 0.1.11
Updated Markdown renderer, draft posts.
- Changelog added.
- Markdown renderer changed to [`markdown-it`](https://github.com/markdown-it/markdown-it).
- Footnote support added using [`markdown-it-footnote`](https://github.com/markdown-it/markdown-it-footnote)
- Primitive support for **draft posts** added. Frontmatter YAML field `draft: true` will  ensure draft posts are not rendered or published.
