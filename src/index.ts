import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import authRoutes from "./routes/auth"
import recordRoutes from "./routes/records"
import { config } from "./config"
import { logger } from "./utils/logger"
import { AppError } from "./utils/errors"
import { prisma } from "./prisma"
import { requestIdMiddleware, RequestWithId } from "./middleware/requestId"
import { HEADERS, API_VERSION, HTTP_STATUS } from "./constants"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"

const app = express()

// Request ID middleware (must be first)
app.use(requestIdMiddleware)

// Security middleware
app.use(
	helmet({
		hidePoweredBy: false,
	})
)

app.set("x-powered-by", "django")

// CORS configuration
app.use(
	cors({
		origin: config.corsOrigin,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", HEADERS.REQUEST_ID],
		exposedHeaders: [HEADERS.REQUEST_ID, HEADERS.API_VERSION],
	})
)

// Response compression
app.use(compression())

// Body parsing middleware (Express built-in)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// API version header middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
	res.setHeader(HEADERS.API_VERSION, API_VERSION)
	next()
})

const limiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.max,
	message: {
		error: "Too many requests from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => req.path === "/",
})
app.use(limiter)

// Request logging middleware
if (config.nodeEnv !== "test") {
	app.use((req: RequestWithId, res: Response, next: NextFunction) => {
		const start = Date.now()
		res.on("finish", () => {
			const duration = Date.now() - start
			const logLevel = res.statusCode >= 400 ? "warn" : "info"
			logger[logLevel]({
				requestId: req.id,
				method: req.method,
				path: req.path,
				statusCode: res.statusCode,
				duration: `${duration}ms`,
				ip: req.ip,
				userAgent: req.get("user-agent"),
			})
		})
		next()
	})
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Check API and database connectivity status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: API is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
app.get("/", async (_req: Request, res: Response) => {
	try {
		await prisma.$queryRaw`SELECT 1`
		const dbStatus = "connected"

		res.json({
			status: "healthy",
			message: "RBAC+ReBAC Prisma TS API",
			version: "1.0.0",
			environment: config.nodeEnv,
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			database: {
				status: dbStatus,
				provider: "postgresql",
			},
			services: {
				api: "operational",
				database: dbStatus,
			},
		})
	} catch (error) {
		logger.error("Health check failed:", error)
		res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
			status: "unhealthy",
			message: "RBAC+ReBAC Prisma TS API",
			version: "1.0.0",
			environment: config.nodeEnv,
			timestamp: new Date().toISOString(),
			database: {
				status: "disconnected",
				error:
					config.nodeEnv === "production"
						? "Database unavailable"
						: String(error),
			},
			services: {
				api: "operational",
				database: "disconnected",
			},
		})
	}
})

// Swagger UI documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Swagger JSON endpoint
app.get("/api-docs.json", (_req: Request, res: Response) => {
	res.setHeader("Content-Type", "application/json")
	res.send(swaggerSpec)
})

// API routes with versioning
app.use(`/api/${API_VERSION}/auth`, authRoutes)
app.use(`/api/${API_VERSION}/records`, recordRoutes)

// Legacy routes (backward compatibility)
app.use("/auth", authRoutes)
app.use("/records", recordRoutes)

// 404 handler
app.use((req: RequestWithId, res: Response) => {
	res.status(HTTP_STATUS.NOT_FOUND).json({
		error: "Not Found",
		message: `Route ${req.method} ${req.path} not found`,
		path: req.path,
		requestId: req.id,
	})
})

// Global error handler
app.use(
	(
		err: Error | AppError,
		req: RequestWithId,
		res: Response,
		_next: NextFunction
	) => {
		// Log error
		if (err instanceof AppError) {
			logger.warn({
				requestId: req.id,
				error: err.name,
				message: err.message,
				statusCode: err.statusCode,
				path: req.path,
				method: req.method,
				stack: config.nodeEnv !== "production" ? err.stack : undefined,
			})
		} else {
			logger.error({
				requestId: req.id,
				error: err.name,
				message: err.message,
				path: req.path,
				method: req.method,
				stack: err.stack,
			})
		}

		// Send error response
		if (err instanceof AppError) {
			res.status(err.statusCode).json({
				error: err.name,
				message: err.message,
				requestId: req.id,
				...(err instanceof Error &&
					err.name === "ValidationError" && {
						fields: (err as any).fields,
					}),
				...(config.nodeEnv !== "production" && {
					stack: err.stack,
				}),
			})
		} else {
			res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
				error: "InternalServerError",
				message:
					config.nodeEnv === "production"
						? "Internal server error"
						: err.message || "Internal server error",
				requestId: req.id,
				...(config.nodeEnv !== "production" && {
					stack: err.stack,
				}),
			})
		}
	}
)

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
	logger.info(`${signal} received. Starting graceful shutdown...`)

	try {
		await prisma.$disconnect()
		logger.info("Database connection closed")
		process.exit(0)
	} catch (error) {
		logger.error("Error during shutdown:", error)
		process.exit(1)
	}
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

// Start server
const PORT = config.port
const server = app.listen(PORT, () => {
	logger.info("=".repeat(60))
	logger.info("> Server Started Successfully")
	logger.info("=".repeat(60))
	logger.info(`📍 Environment: ${config.nodeEnv.toUpperCase()}`)
	logger.info(`🌐 Server URL: http://localhost:${PORT}`)
	logger.info(`📊 Health Check: http://localhost:${PORT}/`)
	logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
	logger.info(` Auth Endpoints: http://localhost:${PORT}/auth`)
	logger.info(`📝 Records Endpoints: http://localhost:${PORT}/records`)
	logger.info("=".repeat(60))
})

server.on("error", (error: NodeJS.ErrnoException) => {
	if (error.syscall !== "listen") {
		throw error
	}

	switch (error.code) {
		case "EADDRINUSE":
			logger.error(`Port ${PORT} is already in use`)
			process.exit(1)
			break
		case "EACCES":
			logger.error(`Permission denied to access port ${PORT}`)
			process.exit(1)
			break
		default:
			throw error
	}
})

export default app
