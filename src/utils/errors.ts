export class AppError extends Error {
	public readonly statusCode: number
	public readonly isOperational: boolean
	public readonly code?: string

	constructor(
		message: string,
		statusCode: number = 500,
		isOperational: boolean = true,
		code?: string
	) {
		super(message)
		this.statusCode = statusCode
		this.isOperational = isOperational
		this.code = code
		Error.captureStackTrace(this, this.constructor)
	}
}

export class BadRequestError extends AppError {
	constructor(message: string = "Bad Request", code?: string) {
		super(message, 400, true, code)
		this.name = "BadRequestError"
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string = "Unauthorized", code?: string) {
		super(message, 401, true, code)
		this.name = "UnauthorizedError"
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string = "Forbidden", code?: string) {
		super(message, 403, true, code)
		this.name = "ForbiddenError"
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = "Resource not found", code?: string) {
		super(message, 404, true, code)
		this.name = "NotFoundError"
	}
}

export class ConflictError extends AppError {
	constructor(message: string = "Resource conflict", code?: string) {
		super(message, 409, true, code)
		this.name = "ConflictError"
	}
}

export class InternalServerError extends AppError {
	constructor(message: string = "Internal server error", code?: string) {
		super(message, 500, false, code)
		this.name = "InternalServerError"
	}
}

export class DatabaseError extends AppError {
	constructor(message: string = "Database error", code?: string) {
		super(message, 500, false, code || "DATABASE_ERROR")
		this.name = "DatabaseError"
	}
}

export class ValidationError extends BadRequestError {
	public readonly fields?: Record<string, string[]>

	constructor(
		message: string = "Validation failed",
		fields?: Record<string, string[]>
	) {
		super(message, "VALIDATION_ERROR")
		this.name = "ValidationError"
		this.fields = fields
	}
}
