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

/**
 * @swagger
 * /records/rbac/{id}:
 *   get:
 *     summary: Get patient record using RBAC
 *     description: Retrieve a patient record using Role-Based Access Control. Requires 'record:read' permission.
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Patient record ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Record fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PatientRecord'
 *       400:
 *         description: Invalid record ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
 * @swagger
 * /records/rebac/{id}:
 *   get:
 *     summary: Get patient record using ReBAC
 *     description: Retrieve a patient record using Relationship-Based Access Control. Requires 'assigned_to' relationship with record owner.
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Patient record ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Record fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PatientRecord'
 *       400:
 *         description: Invalid record ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - No relationship found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
