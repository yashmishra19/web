import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import mongoose from 'mongoose'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err.message)

  if (err instanceof ZodError) {
    const messages = err.errors.map(e =>
      `${e.path.join('.')}: ${e.message}`
    )
    res.status(400).json({
      error: 'Validation error',
      message: messages.join(', '),
      code: 'VALIDATION_ERROR',
    })
    return
  }

  if (
    err instanceof mongoose.mongo.MongoServerError
    && (err as any).code === 11000
  ) {
    const field = Object.keys(
      (err as any).keyValue || {}
    )[0]
    res.status(409).json({
      error: 'Conflict',
      message: `${field || 'Field'} already exists`,
      code: 'DUPLICATE_KEY',
    })
    return
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      error: 'Bad request',
      message: 'Invalid ID format',
      code: 'INVALID_ID',
    })
    return
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors)
      .map(e => e.message)
    res.status(400).json({
      error: 'Validation error',
      message: messages.join(', '),
      code: 'VALIDATION_ERROR',
    })
    return
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong',
  })
}

export const notFound = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  })
}
