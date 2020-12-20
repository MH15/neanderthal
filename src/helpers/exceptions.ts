// Negative codes are errors, positive are warnings

// When a file is not found.
export class ResourceNotFound extends Error implements NeanderthalError {
    code: number
    constructor(message) {
        super(`Resource not found: ${message}`)

        this.name = this.constructor.name
        this.code = -2
    }
}

export class NunjucksRenderError extends Error implements NeanderthalError {
    code: number
    constructor(message, line, col) {
        super(`Nunjucks error: ${message} [Line ${line}, Column ${col}]`)

        this.name = this.constructor.name
        this.code = -3
    }
}

// https://github.com/mozilla/nunjucks/issues/1300
export class TempNunjucksRenderError extends Error implements NeanderthalError {
    code: number
    constructor(message) {
        super(`Nunjucks error: ${message}`)

        this.name = this.constructor.name
        this.code = -3
    }
}

export class FrontMatterFieldNotFound extends Error implements NeanderthalError {
    code: number = 1
    constructor(field, file) {
        super(`Missing field "${field}" in frontmatter at "${file}"`)

        this.name = this.constructor.name
    }
}

export interface NeanderthalError {
    name: string
    code: number
    message: string
}