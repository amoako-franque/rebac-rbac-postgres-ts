import winston from "winston"
import { config } from "../config"

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
}

const colors = {
	error: "red",
	warn: "yellow",
	info: "gray",
	http: "magenta",
	debug: "white",
}

winston.addColors(colors)

const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
	winston.format.json()
)

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
	winston.format.colorize({ all: true }),
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.printf(
		(info) =>
			`${info.timestamp} ${info.level}: ${info.message}${
				info.stack ? `\n${info.stack}` : ""
			}`
	)
)

const transports: winston.transport[] = [
	new winston.transports.Console({
		format: config.nodeEnv === "production" ? format : consoleFormat,
	}),
]

if (config.nodeEnv === "production") {
	transports.push(
		new winston.transports.File({
			filename: "logs/error.log",
			level: "error",
			format,
		}),
		new winston.transports.File({
			filename: "logs/combined.log",
			format,
		})
	)
}

export const logger = winston.createLogger({
	level: config.nodeEnv === "production" ? "info" : "debug",
	levels,
	format,
	transports,
	exceptionHandlers: [
		new winston.transports.Console({
			format: consoleFormat,
		}),
	],
	rejectionHandlers: [
		new winston.transports.Console({
			format: consoleFormat,
		}),
	],
})

export const loggerStream = {
	write: (message: string) => {
		logger.http(message.trim())
	},
}

export default logger
