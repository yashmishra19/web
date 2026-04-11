import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
import {
  errorHandler,
  notFound,
} from './middleware/errorHandler'
import { apiLimiter } from './middleware/rateLimit'
import authRoutes           from './routes/auth'
import profileRoutes        from './routes/profile'
import checkinRoutes        from './routes/checkins'
import recommendationRoutes from './routes/recommendations'
import journalRoutes        from './routes/journal'
import dashboardRoutes      from './routes/dashboard'
import analyticsRoutes      from './routes/analytics'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api', apiLimiter)

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'HealSync API running',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth',            authRoutes)
app.use('/api/profile',         profileRoutes)
app.use('/api/checkins',        checkinRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/journal',         journalRoutes)
app.use('/api/dashboard',       dashboardRoutes)
app.use('/api/analytics',       analyticsRoutes)

app.use(notFound)
app.use(errorHandler)

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(
      `🌿 HealSync server running on http://localhost:${PORT}`
    )
  })
}

start()
export default app
