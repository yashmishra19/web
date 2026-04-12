import { Router } from 'express'
import { DailyCheckIn } from '../models'
import {
  authenticate,
  AuthRequest,
} from '../middleware/auth'

const router = Router()

// GET /api/analytics?range=14d
router.get(
  '/',
  authenticate,
  async (req: any, res: any, next: any) => {
    try {
      const range = (req.query.range as string) || '14d'
      const days  = range === '7d'  ? 7
                  : range === '30d' ? 30
                  : 14

      const since = new Date()
      since.setDate(since.getDate() - days)

      const checkins = await DailyCheckIn
        .find({
          userId: req.user!.id,
          date: { $gte: since },
        })
        .sort({ date: 1 })
        .lean()

      const toSeries = (
        field: keyof typeof checkins[0]
      ) =>
        checkins.map(c => ({
          date:  c.date,
          value: (c[field] as number) || 0,
        }))

      res.json({
        data: {
          mood:     toSeries('mood'),
          sleep:    toSeries('sleepHours'),
          stress:   toSeries('stress'),
          wellness: toSeries('wellnessScore'),
        },
      })
    } catch (err) { next(err) }
  }
)

export default router
