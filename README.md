# neanderthal

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