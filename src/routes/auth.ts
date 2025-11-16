import { Router, Request, Response, NextFunction } from "express"
import { body, validationResult } from "express-validator"
import { logger } from "../utils/logger"
import { ValidationError, InternalServerError } from "../utils/errors"
import { registerUser, loginUser } from "../services/auth.service"
import { SUCCESS_MESSAGES, VALIDATION } from "../constants"

const router = Router()

/**
 * Validation middleware wrapper
 */
const handleValidationErrors = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const fields: Record<string, string[]> = {}
		errors.array().forEach((error: any) => {
			if (error.path) {
				if (!fields[error.path]) {
					fields[error.path] = []
				}
				fields[error.path].push(error.msg)
			}
		})
		throw new ValidationError("Validation failed", fields)
	}
	next()
}

/**
 * Register a new user
 * POST /auth/register
 */
router.post(
	"/register",
	[
		body("email")
			.isEmail()
			.withMessage("Invalid email format")
			.normalizeEmail()
			.trim(),
		body("password")
			.isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH })
			.withMessage(
				`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
			)
			.matches(/[A-Z]/)
			.withMessage("Password must contain at least one uppercase letter")
			.matches(/[a-z]/)
			.withMessage("Password must contain at least one lowercase letter")
			.matches(/[0-9]/)
			.withMessage("Password must contain at least one number"),
		body("name").optional().trim().isLength({ min: 1, max: 255 }),
	],
	handleValidationErrors,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password, name } = req.body

			const user = await registerUser(email, password, name)

			res.status(201).json({
				success: true,
				message: SUCCESS_MESSAGES.USER_REGISTERED,
				data: {
					id: user.id,
					email: user.email,
					name: user.name,
				},
			})
		} catch (error) {
			if (error instanceof ValidationError) {
				return next(error)
			}
			// Service layer handles ConflictError and DatabaseError
			next(error)
		}
	}
)

/**
 * Login user and return JWT token
 * POST /auth/login
 */
router.post(
	"/login",
	[
		body("email")
			.isEmail()
			.withMessage("Invalid email format")
			.normalizeEmail()
			.trim(),
		body("password").notEmpty().withMessage("Password is required"),
	],
	handleValidationErrors,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = req.body

			const result = await loginUser(email, password)

			res.json({
				success: true,
				message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
				data: result,
			})
		} catch (error) {
			if (error instanceof ValidationError) {
				return next(error)
			}
			// Service layer handles UnauthorizedError
			if (error instanceof Error && error.name.includes("Unauthorized")) {
				return next(error)
			}
			logger.error("Login error:", error)
			next(new InternalServerError("Failed to process login"))
		}
	}
)

export default router
