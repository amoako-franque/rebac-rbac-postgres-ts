import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../prisma"
import { config } from "../config"
import { logger } from "../utils/logger"
import {
	UnauthorizedError,
	ConflictError,
	DatabaseError,
} from "../utils/errors"

/**
 * Register a new user
 */
export const registerUser = async (
	email: string,
	password: string,
	name?: string
) => {
	// Check if user already exists
	const existing = await prisma.user.findUnique({ where: { email } })
	if (existing) {
		throw new ConflictError("User with this email already exists")
	}

	// Hash password
	const hash = await bcrypt.hash(password, config.security.bcryptRounds)

	// Create user
	try {
		const user = await prisma.user.create({
			data: {
				email,
				password: hash,
				name: name || null,
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		})

		logger.info(`User registered: ${user.email} (ID: ${user.id})`)
		return user
	} catch (error) {
		logger.error("Registration error:", error)
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			throw new ConflictError("User with this email already exists")
		}
		throw new DatabaseError("Failed to register user")
	}
}

/**
 * Authenticate user and generate JWT token
 */
export const loginUser = async (email: string, password: string) => {
	// Find user with roles and permissions
	const user = await prisma.user.findUnique({
		where: { email },
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
		logger.warn(`Failed login attempt for email: ${email}`)
		throw new UnauthorizedError("Invalid email or password")
	}

	// Verify password
	const passwordMatch = await bcrypt.compare(password, user.password)
	if (!passwordMatch) {
		logger.warn(`Failed login attempt for user ID: ${user.id}`)
		throw new UnauthorizedError("Invalid email or password")
	}

	// Generate JWT token
	const tokenPayload: any = {
		userId: user.id,
		email: user.email,
	}

	const tokenOptions: jwt.SignOptions = {
		expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
	}

	if (config.jwt.issuer) {
		tokenOptions.issuer = config.jwt.issuer
	}
	if (config.jwt.audience) {
		tokenOptions.audience = config.jwt.audience
	}

	const token = jwt.sign(tokenPayload, config.jwt.secret, tokenOptions)

	logger.info(`User logged in: ${user.email} (ID: ${user.id})`)

	return {
		token,
		expiresIn: config.jwt.expiresIn,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
		},
	}
}
