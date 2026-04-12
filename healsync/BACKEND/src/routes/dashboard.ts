import { Router } from 'express'
import {
  DailyCheckIn,
  Recommendation,
  UserProfile,
  User,
} from '../models'
import {
  authenticate,
  AuthRequest,
} from '../middleware/auth'
import {
  recommendationEngine,
} from '../services/recommendations'
import {
  computeWellnessStatus,
} from '../services/wellness'

const router = Router()

// GET /api/dashboard
router.get(
  '/',
  authenticate,
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.user!.id

      const [user, recentCheckIns, profile] =
        await Promise.all([
          User.findById(userId),
          DailyCheckIn
            .find({ userId })
            .sort({ date: -1 })
            .limit(14)
            .lean() as any,
          UserProfile.findOne({ userId }).lean() as any,
        ])

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayCheckIn = recentCheckIns.find((c: any) => {
        const d = new Date(c.date)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === today.getTime()
      })

      const latestScore =
        recentCheckIns[0]?.wellnessScore || 0
      const allScores = recentCheckIns
        .map((c: any) => c.wellnessScore)
        .reverse()
      const wellnessStatus =
        computeWellnessStatus(allScores)

      const last7 = recentCheckIns
        .slice(0, 7)
        .reverse()
      const sleepLast7Days = last7.map(
        (c: any) => c.sleepHours || 0
      )

      const recs = recommendationEngine.generate({
        recentCheckIns,
        profile,
        userId,
      })

      await Recommendation.deleteMany({
        userId,
        createdAt: { $gte: today },
      })

      const savedRecs = await Recommendation.insertMany(
        recs.map(r => ({ ...r, userId }))
      )

      res.json({
        data: {
          wellnessScore:    latestScore,
          wellnessStatus,
          todayMood:
            todayCheckIn?.mood || null,
          streakCount:
            user?.streakCount || 0,
          sleepLast7Days,
          waterToday:
            todayCheckIn?.waterIntakeLiters || 0,
          stressToday:
            todayCheckIn?.stress || null,
          activityToday:
            todayCheckIn?.stepsOrMinutes || 0,
          recommendations:  savedRecs.slice(0, 3),
          hasCheckedInToday: !!todayCheckIn,
        },
      })
    } catch (err) { next(err) }
  }
)

export default router
