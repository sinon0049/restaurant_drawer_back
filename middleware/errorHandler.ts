import type { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const normalizedError = error instanceof Error ? error : new Error(String(error))
  const route = req.route && typeof req.route.path === 'string'
    ? `${req.baseUrl}${req.route.path}`
    : req.path

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    method: req.method,
    route,
    error: {
      name: normalizedError.name,
      message: normalizedError.message,
      stack: normalizedError.stack,
    },
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify(logEntry))
  } else {
    const errorDetails = normalizedError.stack
      ?? `${normalizedError.name}: ${normalizedError.message}`
    const formattedLog = [
      `[${logEntry.timestamp}] ERROR ${req.method} ${route}`,
      errorDetails,
    ].join('\n')

    console.error(formattedLog)
  }

  if (res.headersSent) {
    return next(error)
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  })
}

export default errorHandler
