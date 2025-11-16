import { prisma } from "../prisma"
import { logger } from "../utils/logger"
import { NotFoundError, DatabaseError } from "../utils/errors"

/**
 * Get patient record by ID
 */
export const getRecordById = async (id: number) => {
	try {
		const record = await prisma.patientRecord.findUnique({
			where: { id },
			select: {
				id: true,
				patientName: true,
				data: true,
				ownerId: true,
			},
		})

		if (!record) {
			throw new NotFoundError(`Record with ID ${id} not found`)
		}

		return record
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error
		}
		logger.error("Record fetch error:", error)
		throw new DatabaseError("Failed to fetch record")
	}
}
