import { Router } from 'express'
import { z } from 'zod'
import { JournalEntry } from '../models'
import {
  authenticate,
  AuthRequest,
} from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const journalSchema = z.object({
  content: z.string().min(1).max(5000),
  moodTag: z.number().int().min(1).max(5)
    .nullable().optional(),
  date:    z.string().optional(),
})

// POST /api/journal
router.post(
  '/',
  authenticate,
  validate(journalSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const entry = await JournalEntry.create({
        userId: req.user!.id,
        ...req.body,
        date: req.body.date
          ? new Date(req.body.date)
          : new Date(),
      })
      res.status(201).json({
        data: entry,
        message: 'Journal entry saved',
      })
    } catch (err) { next(err) }
  }
)

// GET /api/journal?page=1&limit=10
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const page  = parseInt(
        req.query.page as string
      ) || 1
      const limit = parseInt(
        req.query.limit as string
      ) || 10
      const skip  = (page - 1) * limit

      const [entries, total] = await Promise.all([
        JournalEntry
          .find({ userId: req.user!.id })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit),
        JournalEntry.countDocuments({
          userId: req.user!.id,
        }),
      ])

      res.json({
        data: entries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (err) { next(err) }
  }
)

// PUT /api/journal/:id
router.put(
  '/:id',
  authenticate,
  validate(journalSchema.partial()),
  async (req: AuthRequest, res, next) => {
    try {
      const entry = await JournalEntry.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!.id },
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      if (!entry) {
        res.status(404).json({
          error: 'Not found',
          message: 'Journal entry not found',
        })
        return
      }
      res.json({
        data: entry,
        message: 'Entry updated',
      })
    } catch (err) { next(err) }
  }
)

// DELETE /api/journal/:id
router.delete(
  '/:id',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const entry = await JournalEntry.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!.id,
      })
      if (!entry) {
        res.status(404).json({
          error: 'Not found',
          message: 'Journal entry not found',
        })
        return
      }
      res.json({
        data: null,
        message: 'Entry deleted',
      })
    } catch (err) { next(err) }
  }
)

export default router
