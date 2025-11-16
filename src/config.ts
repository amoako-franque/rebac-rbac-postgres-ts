import dotenv from "dotenv"

dotenv.config()

export interface Config {
	port: number
	nodeEnv: string
	databaseUrl: string
	corsOrigin: string | string[]
	jwt: {
		secret: string
		issuer?: string
		audience?: string
		expiresIn: string
	}
	rateLimit: {
		windowMs: number
		max: number
	}
	security: {
		bcryptRounds: number
		minPasswordLength: number
	}
}

/**
 * Get environment variable with optional default value
 * @param name - Environment variable name
 * @param defaultValue - Optional default value
 * @returns Environment variable value or default
 * @throws Error if variable is required but not set
 */
function getEnvVar(name: string, defaultValue?: string): string {
	const value = process.env[name]
	if (!value && !defaultValue) {
		throw new Error(`Missing required environment variable: ${name}`)
	}
	return value || defaultValue!
}

/**
 * Get environment variable as number with optional default value
 * @param name - Environment variable name
 * @param defaultValue - Optional default value
 * @returns Parsed number value
 * @throws Error if variable is required but not set or invalid
 */
function getEnvVarAsNumber(name: string, defaultValue?: number): number {
	const value = process.env[name]
	if (!value && defaultValue !== undefined) {
		return defaultValue
	}
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`)
	}
	const num = parseInt(value, 10)
	if (isNaN(num)) {
		throw new Error(`Invalid number for environment variable: ${name}`)
	}
	return num
}

/**
 * Parse CORS origin string to array if needed
 * @param origin - CORS origin string (comma-separated or single value)
 * @returns Array of origins or single origin string
 */
function parseCorsOrigin(origin: string): string | string[] {
	if (origin === "*") {
		return "*"
	}
	if (origin.includes(",")) {
		return origin.split(",").map((o) => o.trim())
	}
	return origin
}

/**
 * Application configuration object
 */
export const config: Config = {
	port: getEnvVarAsNumber("PORT", 4090),
	nodeEnv: getEnvVar("NODE_ENV", "development"),
	databaseUrl: getEnvVar("DATABASE_URL"),
	corsOrigin: parseCorsOrigin(getEnvVar("CORS_ORIGIN", "*")),
	jwt: {
		secret: getEnvVar("JWT_SECRET"),
		issuer: process.env.JWT_ISSUER,
		audience: process.env.JWT_AUDIENCE,
		expiresIn: getEnvVar("JWT_EXPIRES_IN", "7d"),
	},
	rateLimit: {
		windowMs: getEnvVarAsNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000), // 15 minutes
		max: getEnvVarAsNumber("RATE_LIMIT_MAX", 100), // 100 requests per window
	},
	security: {
		bcryptRounds: getEnvVarAsNumber("BCRYPT_ROUNDS", 10),
		minPasswordLength: getEnvVarAsNumber("MIN_PASSWORD_LENGTH", 8),
	},
}

/**
 * Validate critical configuration in production
 */
if (config.nodeEnv === "production") {
	if (
		config.jwt.secret === "secret" ||
		config.jwt.secret.length < 32 ||
		config.jwt.secret === process.env.DATABASE_URL
	) {
		throw new Error(
			"JWT_SECRET must be at least 32 characters and unique in production"
		)
	}

	if (!config.databaseUrl || config.databaseUrl.includes("localhost")) {
		console.warn(
			"⚠️  Warning: Using localhost database in production is not recommended"
		)
	}

	if (config.corsOrigin === "*") {
		console.warn(
			"⚠️  Warning: CORS origin is set to '*' in production. Consider restricting to specific domains."
		)
	}
}

export default config
