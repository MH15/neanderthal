const mustache = require("mustache")
const marked = require("marked")
const fs = require("fs-extra")
const path = require("path")
const { resolve } = require("path")





// console.log("neanderthal time")


// Delete then create the `build` directory
deleteDir("build")
makeDir("build")
// Create `build/blog`
makeDir("build/blog")



async function build() {
	let templatesMap = await loadTemplates()
	console.log("Templates: ", templatesMap)


	// From the root `posts` directory, parse every folder as its own post, using the “post” template from `templates/post.html`.
	fs.readdir("posts", (err, folders) => {
		folders.forEach(async folder => {
			let folderPath = path.join("posts", folder)
			if (isDir(folderPath)) {
				let postPath = path.join("build", "blog", folder)
				makeDir(postPath)
				let indexPath = path.join(folderPath, "index.md")
				let html = await renderMarkdownPage(indexPath, templatesMap.get("templates/post.mustache"))
				console.log(html)
				let buildPath = path.join(postPath, "index.html")
				writeFile(buildPath, html)
			}
		})
	})
}

build()





function renderMarkdownPage(filepath, template) {
	return new Promise((resolve, reject) => {
		readFile(filepath, (result) => {
			let markdown = marked(result)
			// console.log(template)
			let html = mustache.render(template, {
				markdown
			})
			resolve(html)
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
	let dir = path.parse(filepath).dir
	makeDir(dir)
	fs.writeFileSync(filepath, content)
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
				// console.log("done", e)
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
		// console.log(templatePath)
		readFile(templatePath, result => {
			resolve([templatePath, result])
		})
	})
}