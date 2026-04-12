import { Router } from 'express'
import {
  Recommendation,
  DailyCheckIn,
  UserProfile,
} from '../models'
import {
  authenticate,
  AuthRequest,
} from '../middleware/auth'
import {
  recommendationEngine,
} from '../services/recommendations'

const router = Router()

// GET /api/recommendations
router.get(
  '/',
  authenticate,
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.user!.id

      const [recentCheckIns, profile] =
        await Promise.all([
          DailyCheckIn
            .find({ userId })
            .sort({ date: -1 })
            .limit(7)
            .lean() as any,
          UserProfile.findOne({ userId }).lean() as any,
        ])

      const recs = recommendationEngine.generate({
        recentCheckIns,
        profile,
        userId,
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await Recommendation.deleteMany({
        userId,
        createdAt: { $gte: today },
      })

      const saved = await Recommendation.insertMany(
        recs.map(r => ({ ...r, userId }))
      )

      res.json({ data: saved })
    } catch (err) { next(err) }
  }
)

// GET /api/recommendations/history
router.get(
  '/history',
  authenticate,
  async (req: any, res: any, next: any) => {
    try {
      const recs = await Recommendation
        .find({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .limit(20)
      res.json({ data: recs })
    } catch (err) { next(err) }
  }
)

// PATCH /api/recommendations/:id/read
router.patch(
  '/:id/read',
  authenticate,
  async (req: any, res: any, next: any) => {
    try {
      const rec = await Recommendation.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!.id },
        { isRead: true },
        { new: true }
      )
      if (!rec) {
        res.status(404).json({
          error: 'Not found',
          message: 'Recommendation not found',
        })
        return
      }
      res.json({ data: rec })
    } catch (err) { next(err) }
  }
)

export default router
