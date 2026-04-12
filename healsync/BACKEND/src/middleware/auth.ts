import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
  body: any
}

interface JWTPayload {
  id: string
  email: string
  role: string
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      })
      return
    }
    const token  = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET not configured')
    }
    const decoded = jwt.verify(token, secret) as JWTPayload
    req.user = {
      id:    decoded.id,
      email: decoded.email,
      role:  decoded.role,
    }
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      })
      return
    }
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    })
  }
}

export const requireRole = (roles: string[]) =>
  (req: AuthRequest,
   res: Response,
   next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      })
      return
    }
    next()
  }
