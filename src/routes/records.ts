import { Router, Response, NextFunction } from "express"
import { param } from "express-validator"
import { requireAuth, AuthRequest } from "../middleware/auth"
import { rbac } from "../middleware/rbac"
import { rebacResource } from "../middleware/rebac"
import { logger } from "../utils/logger"
import { BadRequestError, NotFoundError } from "../utils/errors"
import { getRecordById } from "../services/record.service"
import { SUCCESS_MESSAGES } from "../constants"

const router = Router()

const validateRecordId = [
	param("id")
		.isInt({ min: 1 })
		.withMessage("Record ID must be a positive integer")
		.toInt(),
]

router.get(
	"/rbac/:id",
	requireAuth,
	validateRecordId,
	rbac("record:read"),
	async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const id = parseInt(req.params.id, 10)

			const record = await getRecordById(id)

			logger.info(`Record accessed via RBAC: ${id} by user ${req.user?.id}`)

			res.json({
				success: true,
				message: SUCCESS_MESSAGES.RECORD_FETCHED,
				data: record,
			})
		} catch (error) {
			if (error instanceof NotFoundError || error instanceof BadRequestError) {
				return next(error)
			}
			// Service layer handles DatabaseError
			next(error)
		}
	}
)

/**
 * Get patient record using ReBAC (Relationship-Based Access Control)
 * GET /records/rebac/:id
 * Requires: assigned_to relationship with record owner
 */
router.get(
	"/rebac/:id",
	requireAuth,
	validateRecordId,
	rebacResource("assigned_to"),
	async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const id = parseInt(req.params.id, 10)

			const record = await getRecordById(id)

			logger.info(`Record accessed via ReBAC: ${id} by user ${req.user?.id}`)

			res.json({
				success: true,
				message: SUCCESS_MESSAGES.RECORD_FETCHED,
				data: record,
			})
		} catch (error) {
			if (error instanceof NotFoundError || error instanceof BadRequestError) {
				return next(error)
			}
			// Service layer handles DatabaseError
			next(error)
		}
	}
)

export default router
