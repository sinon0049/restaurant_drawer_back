import type { Request, Response, NextFunction } from 'express'
import * as z from 'zod'

export const validateRequestBody = (Schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = Schema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            })
        }

        req.body = result.data
        return next()
    }
}