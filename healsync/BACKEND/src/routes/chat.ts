import { Router } from 'express'
import {
  handleChat,
  getChatHistory,
} from '../controller/chat'
import { authenticate } from '../middleware/auth'

const router = Router()

// GET /api/chat/history
router.get('/history', authenticate, getChatHistory)

// POST /api/chat
router.post('/', authenticate, handleChat)

export default router
