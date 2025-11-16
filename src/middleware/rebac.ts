import { Response, NextFunction } from "express"
import { AuthRequest } from "./auth"
import { prisma } from "../prisma"
import { logger } from "../utils/logger"
import {
	ForbiddenError,
	UnauthorizedError,
	BadRequestError,
	NotFoundError,
} from "../utils/errors"

/**
 * ReBAC middleware factory
 * Creates middleware that checks if user has the required relationship with resource owner
 * @param relationType - Type of relationship required (e.g., "assigned_to")
 * @returns Express middleware function
 */
export function rebacResource(relationType: string) {
	return async (req: AuthRequest, _res: Response, next: NextFunction) => {
		try {
			const user = req.user
			if (!user) {
				throw new UnauthorizedError("User not authenticated")
			}

			const id = parseInt(req.params.id, 10)
			if (!id || isNaN(id) || id < 1) {
				throw new BadRequestError("Invalid or missing record ID")
			}

			const record = await prisma.patientRecord.findUnique({
				where: { id },
				select: {
					id: true,
					ownerId: true,
				},
			})

			if (!record) {
				throw new NotFoundError(`Record with ID ${id} not found`)
			}

			if (record.ownerId === user.id) {
				logger.debug(
					`ReBAC check passed: User ${user.id} is the owner of record ${id}`
				)
				return next()
			}

			const relationship = await prisma.relationship.findUnique({
				where: {
					subjectId_objectId_type: {
						subjectId: user.id,
						objectId: record.ownerId,
						type: relationType,
					},
				},
			})

			if (relationship) {
				logger.debug(
					`ReBAC check passed: User ${user.id} has ${relationType} relationship with record owner ${record.ownerId}`
				)
				return next()
			}

			logger.warn(
				`ReBAC check failed: User ${user.id} lacks ${relationType} relationship with record owner ${record.ownerId}`,
				{
					userId: user.id,
					recordId: id,
					recordOwnerId: record.ownerId,
					requiredRelationship: relationType,
				}
			)

			throw new ForbiddenError(
				`No ${relationType} relationship found with record owner`
			)
		} catch (error) {
			if (
				error instanceof ForbiddenError ||
				error instanceof UnauthorizedError ||
				error instanceof BadRequestError ||
				error instanceof NotFoundError
			) {
				return next(error)
			}
			logger.error("ReBAC middleware error:", error)
			next(error)
		}
	}
}
