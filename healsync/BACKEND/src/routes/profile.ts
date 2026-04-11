import { Router } from 'express'
import { z } from 'zod'
import { UserProfile, User } from '../models'
import {
  authenticate,
  AuthRequest,
} from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const onboardingSchema = z.object({
  age:               z.number().int().min(13).max(120),
  gender:            z.enum([
    'male','female','non_binary','prefer_not_to_say'
  ]),
  heightCm:          z.number().min(50).max(300),
  weightKg:          z.number().min(10).max(500),
  sleepHours:        z.number().min(0).max(24),
  activityLevel:     z.enum([
    'sedentary','lightly_active',
    'moderately_active','very_active','extra_active',
  ]),
  waterIntakeLiters: z.number().min(0).max(20),
  dietPreference:    z.enum([
    'omnivore','vegetarian','vegan','pescatarian',
    'keto','paleo','gluten_free','other',
  ]),
  stressLevel:       z.number().int().min(1).max(5),
  moodBaseline:      z.number().int().min(1).max(5),
  workStudyHours:    z.number().min(0).max(24),
  mainGoal:          z.enum([
    'lose_weight','gain_muscle','improve_sleep','reduce_stress',
    'improve_fitness','better_nutrition','mental_wellness','general_health',
  ]),
  existingConditions: z.array(z.string()).optional(),
})

// POST /api/profile/onboarding
router.post(
  '/onboarding',
  authenticate,
  validate(onboardingSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.id

      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        { ...req.body, userId },
        { upsert: true, new: true, runValidators: true }
      )

      await User.findByIdAndUpdate(userId, {
        hasCompletedOnboarding: true,
      })

      res.json({
        data: profile,
        message: 'Profile saved successfully',
      })
    } catch (err) { next(err) }
  }
)

// GET /api/profile/me
router.get(
  '/me',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const profile = await UserProfile.findOne({
        userId: req.user!.id,
      })
      res.json({ data: profile || null })
    } catch (err) { next(err) }
  }
)

// PUT /api/profile/reminders
router.put(
  '/reminders',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user!.id,
        { reminderSettings: req.body },
        { new: true, runValidators: true }
      )
      res.json({
        data: user?.reminderSettings,
        message: 'Reminder settings updated',
      })
    } catch (err) { next(err) }
  }
)

export default router
