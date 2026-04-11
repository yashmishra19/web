import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models'
import { validate } from '../middleware/validate'
import { authLimiter } from '../middleware/rateLimit'
import {
  authenticate,
  AuthRequest,
} from '../middleware/auth'

const router = Router()

const signupSchema = z.object({
  name:     z.string().min(2).max(60),
  email:    z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

function generateToken(user: {
  _id: any
  email: string
  role: string
}): string {
  const secret = process.env.JWT_SECRET!
  return jwt.sign(
    {
      id:    user._id.toString(),
      email: user.email,
      role:  user.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    } as jwt.SignOptions
  )
}

// POST /api/auth/signup
router.post(
  '/signup',
  authLimiter,
  validate(signupSchema),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body

      const existing = await User.findOne({ email })
      if (existing) {
        res.status(409).json({
          error: 'Conflict',
          message:
            'An account with this email already exists',
        })
        return
      }

      const hashed = await bcrypt.hash(password, 12)
      const user   = await User.create({
        name, email, password: hashed,
      })

      const token = generateToken(user)
      res.status(201).json({
        data: {
          token,
          user: user.toPublicJSON(),
        },
        message: 'Account created successfully',
      })
    } catch (err) { next(err) }
  }
)

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body

      const user = await User
        .findOne({ email })
        .select('+password')

      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        })
        return
      }

      const valid = await bcrypt.compare(
        password, user.password
      )
      if (!valid) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        })
        return
      }

      const token = generateToken(user)
      res.json({
        data: {
          token,
          user: user.toPublicJSON(),
        },
        message: 'Login successful',
      })
    } catch (err) { next(err) }
  }
)

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const user = await User.findById(req.user!.id)
      if (!user) {
        res.status(404).json({
          error: 'Not found',
          message: 'User not found',
        })
        return
      }
      res.json({ data: user.toPublicJSON() })
    } catch (err) { next(err) }
  }
)

// POST /api/auth/logout
router.post(
  '/logout',
  authenticate,
  (_req, res) => {
    res.json({
      data: null,
      message: 'Logged out successfully',
    })
  }
)

export default router
