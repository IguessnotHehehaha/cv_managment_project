export class VersionConflictError extends Error {
    constructor(message = 'Version conflict — reload and try again') {
        super(message)
        this.name = 'VersionConflictError'
    }
}

export class NotFoundError extends Error {
    constructor(message = 'Not found') {
        super(message)
        this.name = 'NotFoundError'
    }
}

export class DuplicateNameError extends Error {
    constructor(message = 'Name already exists') {
        super(message)
        this.name = 'DuplicateNameError'
    }
}

export class ForbiddenError extends Error {
    constructor(message = 'Forbidden') { super(message); this.name = 'ForbiddenError' }
}

export class DuplicateError extends Error {
    constructor(message = 'Already exists') { super(message); this.name = 'DuplicateError' }
}

export class ValidationError extends Error {
    constructor(message: string) { super(message); this.name = 'ValidationError' }
}

