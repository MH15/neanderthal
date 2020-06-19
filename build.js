const nunjucks = require("nunjucks")
const marked = require("marked")
const fs = require("fs-extra")
const path = require("path")
const frontmatter = require('front-matter')
const { resolve } = require("path")
const { write } = require("fs")

const CLEAN_BUILD = true;



// console.log("neanderthal time")

if (CLEAN_BUILD) {
	// Delete then create the `build` directory
	deleteDir("build")
	makeDir("build")
	// Create `build/blog`
	makeDir("build/blog")

}



async function build() {
	let templatesMap = await loadTemplates()
	// console.log("Templates: ", templatesMap)

	// From the root `posts` directory, parse every folder as its own post, using the “post” template from `templates/post.html`.
	let blog_posts = await renderBlogPosts(templatesMap)

	// Generate the root blog page as a list of recent posts by date
	let template = templatesMap.get("templates/blog.njk")
	let html = nunjucks.renderString(template, {
		title: "Blog Posts",
		blog_posts
	})
	writeFile(path.join("build", "blog", "index.html"), html)



}


build()



function renderBlogPosts(templatesMap) {
	return new Promise((resolve, reject) => {
		fs.readdir("posts", (err, folders) => {
			let blog_posts = []
			if (err) {
				reject(err)
			}
			folders.forEach(async (folder, key) => {
				let folderPath = path.join("posts", folder)
				if (isDir(folderPath)) {
					let postPath = path.join("build", "blog", folder)
					makeDir(postPath)
					let indexPath = path.join(folderPath, "index.md")
					let page = await renderMarkdownPage(indexPath, templatesMap, folder)
					let buildPath = path.join(postPath, "index.html")
					await writeFile(buildPath, page.html)
					// TODO: typescript this
					blog_posts.push(page)
				}

				// resolve Promise on last loop item
				if (Object.is(folders.length - 1, key)) {
					resolve(blog_posts)
				}
			})
		})
	})
}





function renderMarkdownPage(filepath, templatesMap, folder) {
	return new Promise((resolve, reject) => {
		readFile(filepath, (result) => {
			let content = frontmatter(result)

			let attributes = content.attributes

			let markdown = marked(content.body)
			let template = templatesMap.get("templates/post.njk")
			let html = nunjucks.renderString(template, {
				markdown: markdown,
				title: attributes.title || null,
				authors: attributes.authors || [],
				attributes: attributes
			})

			// TODO: typescript this
			let page = {
				title: attributes.title,
				html: html,
				slug: "blog/" + folder
			}
			resolve(page)
		})
	})
}


function readFile(filepath, callback) {
	fs.readFile(filepath, "utf8", (err, result) => {
		if (err) {
			console.error(err)
			throw new Error(err)
		}
		callback(result)
	})
}

function isDir(dir) {
	return fs.existsSync(dir)
}

function makeDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}

function deleteDir(dir) {
	fs.removeSync(dir)
}

function writeFile(filepath, content) {
	return new Promise((resolve, reject) => {
		let dir = path.parse(filepath).dir
		makeDir(dir)
		fs.writeFile(filepath, content, (err) => {
			if (err) {
				reject(err)
			}
			resolve()
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
		readFile(templatePath, result => {
			resolve([templatePath, result])
		})
	})
}