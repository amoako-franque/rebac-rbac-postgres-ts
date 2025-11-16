import { Request, Response, NextFunction } from "express"
import { v4 as uuidv4 } from "uuid"
import { HEADERS } from "../constants"

export interface RequestWithId extends Request {
	id?: string
}

/**
 * Request ID middleware
 * Generates a unique ID for each request and adds it to headers
 */
export const requestIdMiddleware = (
	req: RequestWithId,
	res: Response,
	next: NextFunction
) => {
	const requestId = req.headers[HEADERS.REQUEST_ID.toLowerCase()] || uuidv4()

	req.id = requestId as string

	res.setHeader(HEADERS.REQUEST_ID, requestId as string)

	next()
}
