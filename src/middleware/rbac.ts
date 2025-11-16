import { Response, NextFunction } from "express"
import { AuthRequest } from "./auth"
import { logger } from "../utils/logger"
import { ForbiddenError, UnauthorizedError } from "../utils/errors"

/**
 * RBAC middleware factory
 * Creates middleware that checks if user has the required permission
 * @param permissionName - Name of the required permission (e.g., "record:read")
 * @returns Express middleware function
 */
export function rbac(permissionName: string) {
	return async (req: AuthRequest, _res: Response, next: NextFunction) => {
		try {
			const user = req.user
			if (!user) {
				throw new UnauthorizedError("User not authenticated")
			}

			const permissions = new Set<string>()
			for (const userRole of user.roles) {
				for (const rolePermission of userRole.role.permissions) {
					permissions.add(rolePermission.permission.name)
				}
			}

			if (permissions.has(permissionName)) {
				logger.debug(
					`RBAC check passed: User ${user.id} has permission ${permissionName}`
				)
				return next()
			}

			logger.warn(
				`RBAC check failed: User ${user.id} lacks permission ${permissionName}`,
				{
					userId: user.id,
					requiredPermission: permissionName,
					userPermissions: Array.from(permissions),
				}
			)

			throw new ForbiddenError(
				`Insufficient permissions. Required: ${permissionName}`
			)
		} catch (error) {
			if (
				error instanceof ForbiddenError ||
				error instanceof UnauthorizedError
			) {
				return next(error)
			}
			logger.error("RBAC middleware error:", error)
			next(error)
		}
	}
}
