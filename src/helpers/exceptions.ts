// When a file is not found.
export class ResourceNotFound extends Error implements NeanderthalError {
    code: number
    constructor(message) {
        super(`Resource not found: ${message}`)

        this.name = this.constructor.name
        this.code = -2
    }
}

export interface NeanderthalError {
    name: string
    code: number
    message: string
}