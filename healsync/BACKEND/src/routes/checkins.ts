import { Router } from 'express'
import { z } from 'zod'
import { DailyCheckIn, User } from '../models'
import {
  authenticate,
  AuthRequest,
} from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  computeWellnessScore,
  computeStreakUpdate,
} from '../services/wellness'

const router = Router()

const checkinSchema = z.object({
  mood:              z.number().int().min(1).max(5),
  stress:            z.number().int().min(1).max(5),
  sleepHours:        z.number().min(0).max(24),
  waterIntakeLiters: z.number().min(0).max(20),
  stepsOrMinutes:    z.number().min(0),
  energyLevel:       z.number().int().min(1).max(5),
  notes:             z.string().max(1000).optional(),
  date:              z.string().optional(),
})

// POST /api/checkins
router.post(
  '/',
  authenticate,
  validate(checkinSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.id

      const date = req.body.date
        ? new Date(req.body.date)
        : new Date()
      date.setHours(0, 0, 0, 0)

      const tomorrow = new Date(date)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const existing = await DailyCheckIn.findOne({
        userId,
        date: { $gte: date, $lt: tomorrow },
      })

      if (existing) {
        res.status(409).json({
          error: 'Conflict',
          message: 'Already checked in today',
          data: existing,
        })
        return
      }

      const wellnessScore = computeWellnessScore(req.body)

      const checkIn = await DailyCheckIn.create({
        userId,
        ...req.body,
        wellnessScore,
        date,
      })

      const user = await User.findById(userId)
      if (user) {
        const newStreak = computeStreakUpdate(
          user.lastCheckInDate,
          user.streakCount
        )
        await User.findByIdAndUpdate(userId, {
          streakCount:     newStreak,
          lastCheckInDate: new Date(),
        })
      }

      res.status(201).json({
        data: checkIn,
        message: 'Check-in saved successfully',
      })
    } catch (err) { next(err) }
  }
)

// GET /api/checkins?days=14
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const days = parseInt(
        req.query.days as string
      ) || 14

      const since = new Date()
      since.setDate(since.getDate() - days)

      const checkins = await DailyCheckIn
        .find({
          userId: req.user!.id,
          date: { $gte: since },
        })
        .sort({ date: -1 })

      res.json({ data: checkins })
    } catch (err) { next(err) }
  }
)

// GET /api/checkins/today
router.get(
  '/today',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const checkin = await DailyCheckIn.findOne({
        userId: req.user!.id,
        date: { $gte: today, $lt: tomorrow },
      })

      res.json({ data: checkin || null })
    } catch (err) { next(err) }
  }
)

export default router
