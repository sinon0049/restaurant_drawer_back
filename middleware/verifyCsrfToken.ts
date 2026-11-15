import type { Request, Response, NextFunction } from "express";

const verifyCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    const csrfTokenFromClient = req.get('X-CSRF-Token')

    if(csrfTokenFromClient === undefined || csrfTokenFromClient !== req.session.csrfToken) {
        return res.status(403).json({
            status: 'error',
            message: 'Invalid CSRF token.'
        })
    }

    next()
}

export default verifyCsrfToken