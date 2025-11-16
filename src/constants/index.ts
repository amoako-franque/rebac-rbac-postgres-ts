
/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
	SERVICE_UNAVAILABLE: 503,
} as const

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
	VALIDATION_FAILED: "Validation failed",
	UNAUTHORIZED: "Unauthorized",
	FORBIDDEN: "Forbidden",
	NOT_FOUND: "Resource not found",
	CONFLICT: "Resource conflict",
	INTERNAL_ERROR: "Internal server error",
	INVALID_CREDENTIALS: "Invalid email or password",
	USER_EXISTS: "User with this email already exists",
	TOKEN_EXPIRED: "Token expired",
	TOKEN_INVALID: "Invalid token",
	MISSING_TOKEN: "Missing or invalid authorization header",
} as const

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
	USER_REGISTERED: "User registered successfully",
	LOGIN_SUCCESS: "Login successful",
	RECORD_FETCHED: "Record fetched successfully",
} as const

/**
 * Validation Rules
 */
export const VALIDATION = {
	EMAIL_MAX_LENGTH: 255,
	PASSWORD_MIN_LENGTH: 8,
	NAME_MAX_LENGTH: 255,
	RECORD_ID_MIN: 1,
} as const

/**
 * API Routes
 */
export const ROUTES = {
	AUTH: {
		BASE: "/auth",
		REGISTER: "/auth/register",
		LOGIN: "/auth/login",
	},
	RECORDS: {
		BASE: "/records",
		RBAC: "/records/rbac",
		REBAC: "/records/rebac",
	},
	HEALTH: "/",
} as const

/**
 * Permission Names
 */
export const PERMISSIONS = {
	RECORD_READ: "record:read",
	RECORD_WRITE: "record:write",
} as const

/**
 * Relationship Types
 */
export const RELATIONSHIP_TYPES = {
	ASSIGNED_TO: "assigned_to",
	MANAGES: "manages",
} as const

/**
 * Role Names
 */
export const ROLES = {
	DOCTOR: "doctor",
	NURSE: "nurse",
	ADMIN: "admin",
} as const

/**
 * API Version
 */
export const API_VERSION = "v1" as const

/**
 * Response Headers
 */
export const HEADERS = {
	REQUEST_ID: "X-Request-ID",
	API_VERSION: "X-API-Version",
} as const
