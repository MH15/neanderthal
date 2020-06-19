const nunjucks = require("nunjucks")
const marked = require("marked")
const fs = require("fs-extra")
const io = require("./io")
const path = require("path")
const frontmatter = require('front-matter')
const { resolve } = require("path")
const { write } = require("fs")

const CLEAN_BUILD = true;

let nconfig = require("../nconfig")



// console.log("neanderthal time")

if (CLEAN_BUILD) {
	// Delete then create the `build` directory
	io.deleteDir("build")
	io.makeDir("build")
	// Create `build/blog`
	io.makeDir("build/blog")

}



async function build() {
	let templatesMap = await loadTemplates()
	// console.log("Templates: ", templatesMap)

	// From the root `posts` directory, parse every folder as its own post, using the “post” template from `templates/post.html`.
	let blog_posts = await renderBlogPosts(templatesMap)

	// Sort posts by most recent
	blog_posts.sort(compareDatePublished)
	// Generate the root blog page as a list of recent posts by date
	let html = nunjucks.renderString(templatesMap.get("templates/blog.njk"), {
		blog_posts,
		meta: nconfig.meta
	})
	io.writeFile(path.join("build", "blog", "index.html"), html)

	// From the root `pages` directory, parse every folder as its own page, using the “page” template from `templates/page.njk`.
	let pages = await renderPages(templatesMap)

	// Render `pages/index.njk` from the pages directory to `build/index.html`.
	// This is the homepage of the app.
	let indexPath = path.join("pages", "index.njk")
	let content = fs.readFileSync(path.join("pages", "index.njk"), "utf8")
	console.log(content)
	html = nunjucks.renderString(content, {
		meta: nconfig.meta
	})
	io.writeFile(path.join("build", "index.html"), html)


	// Copy all files from `labs` to `public/labs`. Labs are raw html5 for posting projects outside the blog structure.
	await fs.copy(path.join("labs"), path.join("build", "labs"))


}


build()


function compareDatePublished(a, b) {
	let dateA = new Date(a.date_published)
	let dateB = new Date(b.date_published)
	return dateB.getTime() - dateA.getTime()
}



function renderPages(templatesMap) {
	return new Promise((resolve, reject) => {
		fs.readdir("pages", (err, folders) => {
			if (err) {
				reject(err)
			}
			// Process all blog posts concurrently but wait until last is processed to return
			Promise.all(folders.map(async folder => {
				let folderPath = path.join("pages", folder)
				if (io.isDir(folderPath)) {
					let postPath = path.join("build", folder)
					io.makeDir(postPath)
					let indexPath = path.join(folderPath, "index.njk")
					let page = await renderNunjucksPage(indexPath, templatesMap, folder)
					let buildPath = path.join(postPath, "index.html")
					await io.writeFile(buildPath, page.html)
					// TODO: typescript this
					return page
				}
			})).then(pages => {
				resolve(pages)
			}).catch(err => {
				console.error(err)
				reject(err)
			})

		})
	})
}

function renderBlogPosts(templatesMap) {
	return new Promise((resolve, reject) => {
		fs.readdir("posts", (err, folders) => {
			if (err) {
				reject(err)
			}
			// Process all blog posts concurrently but wait until last is processed to return
			Promise.all(folders.map(async folder => {
				let folderPath = path.join("posts", folder)
				if (io.isDir(folderPath)) {
					let postPath = path.join("build", "blog", folder)
					io.makeDir(postPath)
					let indexPath = path.join(folderPath, "index.md")
					let page = await renderMarkdownPage(indexPath, templatesMap, folder)
					let buildPath = path.join(postPath, "index.html")
					await io.writeFile(buildPath, page.html)
					// TODO: typescript this
					return page
				}
			})).then(blog_posts => {
				resolve(blog_posts)
			}).catch(err => {
				console.error(err)
				reject(err)
			})

		})
	})
}


function renderMarkdownPage(filepath, templatesMap, folder) {
	return new Promise((resolve, reject) => {
		io.readFile(filepath, (result) => {
			let content = frontmatter(result)

			let attributes = content.attributes

			let markdown = marked(content.body)
			let template = templatesMap.get("templates/post.njk")
			let html = nunjucks.renderString(template, {
				markdown: markdown,
				title: attributes.title || null,
				authors: attributes.authors || [],
				attributes: attributes,
				meta: nconfig.meta
			})

			// TODO: typescript this
			let page = {
				title: attributes.title,
				html: html,
				slug: "blog/" + folder,
				date_published: attributes.date_published
			}
			resolve(page)
		})
	})
}

function renderNunjucksPage(filepath, templatesMap, folder) {
	return new Promise((resolve, reject) => {
		io.readFile(filepath, (result) => {
			let template = templatesMap.get("templates/page.njk")
			let html = nunjucks.renderString(template, {
				page: result,
				meta: nconfig.meta
			})
			// TODO: typescript this
			let page = {
				// title: attributes.title,
				html: html,
				slug: "/" + folder,
				// date_publ/ished: attributes.date_published
			}
			resolve(page)
		})
	})
}

function loadTemplates() {
	return new Promise((resolve, reject) => {
		// Load all templates
		let templatesMap = new Map()
		let promises = []
		fs.readdir("templates", (err, templates) => {
			templates.forEach(template => {
				let templatePath = path.join("templates", template)
				if (fs.existsSync(templatePath)) {
					promises.push(loadTemplate(templatePath))
				}
			})
			Promise.all(promises).then((results) => {
				results.forEach(result => {
					templatesMap.set(result[0], result[1])
				})
				resolve(templatesMap)
			}).catch(err => {
				console.error("err", err)
			})
		})
	})
}

function loadTemplate(templatePath) {
	return new Promise((resolve, reject) => {
		io.readFile(templatePath, result => {
			resolve([templatePath, result])
		})
	})
}