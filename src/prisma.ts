/**
 * Prisma Client instance
 * Singleton instance for database access throughout the application
 */

import { PrismaClient } from "@prisma/client"
import { logger } from "./utils/logger"
import { config } from "./config"

/**
 * Prisma Client instance with logging and error handling
 */
export const prisma = new PrismaClient({
	log:
		config.nodeEnv === "development"
			? [
					{
						emit: "event",
						level: "query",
					},
					{
						emit: "event",
						level: "error",
					},
					{
						emit: "event",
						level: "warn",
					},
			  ]
			: [
					{
						emit: "event",
						level: "error",
					},
			  ],
	errorFormat: config.nodeEnv === "production" ? "minimal" : "pretty",
})

if (config.nodeEnv === "development") {
	prisma.$on("query" as never, (e: any) => {
		logger.debug(`Query: ${e.query}`, { duration: `${e.duration}ms` })
	})
}

prisma.$on("error" as never, (e: any) => {
	logger.error("Prisma error:", e)
})

prisma.$on("warn" as never, (e: any) => {
	logger.warn("Prisma warning:", e)
})

process.on("beforeExit", async () => {
	await prisma.$disconnect()
})

export default prisma
