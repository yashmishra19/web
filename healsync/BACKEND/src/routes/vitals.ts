import { Router } from 'express'
import { z } from 'zod'
import { VitalsReading } from '../models'
import {
  authenticate,
  AuthRequest,
} from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  generateVitalsSuggestions,
} from '../services/vitalsSuggestions'

const router = Router()

const vitalsSchema = z.object({
  heartRate:       z.number().min(40).max(200)
                    .nullable().optional(),
  systolicBP:      z.number().min(70).max(200)
                    .nullable().optional(),
  diastolicBP:     z.number().min(40).max(130)
                    .nullable().optional(),
  spO2:            z.number().min(85).max(100)
                    .nullable().optional(),
  steps:           z.number().min(0).max(50000)
                    .nullable().optional(),
  caloriesBurned:  z.number().min(0).max(5000)
                    .nullable().optional(),
  bodyTemperature: z.number().min(35).max(42)
                    .nullable().optional(),
  stressLevel:     z.number().int().min(1).max(5)
                    .nullable().optional(),
  sleepHours:      z.number().min(0).max(24)
                    .nullable().optional(),
  source:          z.enum([
    'manual', 'smartwatch', 'simulated'
  ]).default('manual'),
  recordedAt:      z.string().optional(),
})

// POST /api/vitals
router.post(
  '/',
  authenticate,
  validate(vitalsSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const reading = await VitalsReading.create({
        userId: req.user!.id,
        ...req.body,
        recordedAt: req.body.recordedAt
          ? new Date(req.body.recordedAt)
          : new Date(),
      })

      const suggestions = generateVitalsSuggestions(
        req.body
      )

      res.status(201).json({
        data: { reading, suggestions },
        message: 'Vitals saved successfully',
      })
    } catch (err) { next(err) }
  }
)

// GET /api/vitals?days=7
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const days = parseInt(
        req.query.days as string
      ) || 7

      const since = new Date()
      since.setDate(since.getDate() - days)

      const readings = await VitalsReading
        .find({
          userId: req.user!.id,
          recordedAt: { $gte: since },
        })
        .sort({ recordedAt: -1 })

      res.json({ data: readings })
    } catch (err) { next(err) }
  }
)

// GET /api/vitals/latest
router.get(
  '/latest',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const reading = await VitalsReading
        .findOne({ userId: req.user!.id })
        .sort({ recordedAt: -1 })

      res.json({ data: reading || null })
    } catch (err) { next(err) }
  }
)

// POST /api/vitals/suggestions
// Generate suggestions without saving
router.post(
  '/suggestions',
  authenticate,
  validate(vitalsSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const suggestions = generateVitalsSuggestions(
        req.body
      )
      res.json({ data: suggestions })
    } catch (err) { next(err) }
  }
)

export default router
