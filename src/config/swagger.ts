import swaggerJsdoc from "swagger-jsdoc"
import { config } from "../config"

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "RBAC + ReBAC API",
			version: "1.0.0",
			description:
				"Production-ready REST API demonstrating Role-Based Access Control (RBAC) and Relationship-Based Access Control (ReBAC) patterns using Express.js, TypeScript, Prisma ORM, and PostgreSQL.",
			contact: {
				name: "API Support",
				email: "support@example.com",
			},
			license: {
				name: "MIT",
				url: "https://opensource.org/licenses/MIT",
			},
		},
		servers: [
			{
				url: `http://localhost:${config.port}`,
				description: "Development server",
			},
			{
				url: "https://api.auth.com",
				description: "Production server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "JWT token obtained from /auth/login endpoint",
				},
			},
			schemas: {
				Error: {
					type: "object",
					properties: {
						error: {
							type: "string",
							description: "Error type",
							example: "BadRequestError",
						},
						message: {
							type: "string",
							description: "Error message",
							example: "Validation failed",
						},
						requestId: {
							type: "string",
							description: "Request ID for tracing",
							example: "550e8400-e29b-41d4-a716-446655440000",
						},
						fields: {
							type: "object",
							description: "Validation errors (if applicable)",
							additionalProperties: {
								type: "array",
								items: {
									type: "string",
								},
							},
						},
					},
				},
				SuccessResponse: {
					type: "object",
					properties: {
						success: {
							type: "boolean",
							example: true,
						},
						message: {
							type: "string",
							example: "Operation successful",
						},
						data: {
							type: "object",
						},
					},
				},
				User: {
					type: "object",
					properties: {
						id: {
							type: "integer",
							example: 1,
						},
						email: {
							type: "string",
							format: "email",
							example: "user@example.com",
						},
						name: {
							type: "string",
							nullable: true,
							example: "John Doe",
						},
					},
				},
				PatientRecord: {
					type: "object",
					properties: {
						id: {
							type: "integer",
							example: 1,
						},
						patientName: {
							type: "string",
							example: "Patient Paul",
						},
						data: {
							type: "string",
							example: "Record A",
						},
						ownerId: {
							type: "integer",
							example: 3,
						},
					},
				},
				LoginRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: {
							type: "string",
							format: "email",
							example: "doc@example.com",
						},
						password: {
							type: "string",
							format: "password",
							example: "Password123",
						},
					},
				},
				LoginResponse: {
					type: "object",
					properties: {
						success: {
							type: "boolean",
							example: true,
						},
						message: {
							type: "string",
							example: "Login successful",
						},
						data: {
							type: "object",
							properties: {
								token: {
									type: "string",
									example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
								},
								expiresIn: {
									type: "string",
									example: "7d",
								},
								user: {
									$ref: "#/components/schemas/User",
								},
							},
						},
					},
				},
				RegisterRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: {
							type: "string",
							format: "email",
							example: "user@example.com",
						},
						password: {
							type: "string",
							format: "password",
							minLength: 8,
							example: "Password123",
							description:
								"Password must be at least 8 characters, contain uppercase, lowercase, and number",
						},
						name: {
							type: "string",
							maxLength: 255,
							example: "John Doe",
						},
					},
				},
				HealthCheck: {
					type: "object",
					properties: {
						status: {
							type: "string",
							enum: ["healthy", "unhealthy"],
							example: "healthy",
						},
						message: {
							type: "string",
							example: "RBAC+ReBAC Prisma TS API",
						},
						version: {
							type: "string",
							example: "1.0.0",
						},
						environment: {
							type: "string",
							example: "development",
						},
						timestamp: {
							type: "string",
							format: "date-time",
							example: "2024-01-15T10:30:00.000Z",
						},
						uptime: {
							type: "number",
							example: 3600.5,
						},
						database: {
							type: "object",
							properties: {
								status: {
									type: "string",
									enum: ["connected", "disconnected"],
									example: "connected",
								},
								provider: {
									type: "string",
									example: "postgresql",
								},
							},
						},
						services: {
							type: "object",
							properties: {
								api: {
									type: "string",
									example: "operational",
								},
								database: {
									type: "string",
									example: "connected",
								},
							},
						},
					},
				},
			},
		},
		tags: [
			{
				name: "Health",
				description: "Health check endpoints",
			},
			{
				name: "Authentication",
				description: "User authentication endpoints",
			},
			{
				name: "Records",
				description: "Patient record endpoints (RBAC & ReBAC)",
			},
		],
	},
	apis: [
		"./src/routes/*.ts",
		"./src/index.ts",
		"./src/routes/*.js",
		"./src/index.js",
	],
}

export const swaggerSpec = swaggerJsdoc(options)
