import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "../prisma"
import { config } from "../config"
import { logger } from "../utils/logger"
import { UnauthorizedError } from "../utils/errors"

export interface AuthRequest extends Request {
	user?: {
		id: number
		email: string
		name: string | null
		roles: Array<{
			role: {
				id: number
				name: string
				permissions: Array<{
					permission: {
						id: number
						name: string
					}
				}>
			}
		}>
	}
}

/**
 * Authentication middleware
 * Validates JWT token from Authorization header and attaches user to request
 * @throws UnauthorizedError if authentication fails
 */
export const requireAuth = async (
	req: AuthRequest,
	_res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new UnauthorizedError("Missing or invalid authorization header")
		}

		const token = authHeader.split(" ")[1]
		if (!token) {
			throw new UnauthorizedError("Token not provided")
		}

		const verifyOptions: jwt.VerifyOptions = {}
		if (config.jwt.issuer) {
			verifyOptions.issuer = config.jwt.issuer
		}
		if (config.jwt.audience) {
			verifyOptions.audience = config.jwt.audience
		}

		let payload: any
		try {
			payload = jwt.verify(token, config.jwt.secret, verifyOptions)
		} catch (err) {
			if (err instanceof jwt.TokenExpiredError) {
				throw new UnauthorizedError("Token expired")
			}
			if (err instanceof jwt.JsonWebTokenError) {
				throw new UnauthorizedError("Invalid token")
			}
			throw err
		}

		if (!payload?.userId) {
			throw new UnauthorizedError("Invalid token payload")
		}

		const user = await prisma.user.findUnique({
			where: { id: payload.userId },
			include: {
				roles: {
					include: {
						role: {
							include: {
								permissions: {
									include: { permission: true },
								},
							},
						},
					},
				},
			},
		})

		if (!user) {
			logger.warn(`User not found for token payload userId: ${payload.userId}`)
			throw new UnauthorizedError("User not found")
		}

		req.user = user as AuthRequest["user"]
		next()
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			logger.warn(`Authentication failed: ${error.message}`, {
				path: req.path,
				ip: req.ip,
			})
			return next(error)
		}
		logger.error("Auth middleware error:", error)
		next(new UnauthorizedError("Authentication failed"))
	}
}
