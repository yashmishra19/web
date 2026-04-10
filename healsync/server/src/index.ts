import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { connectDB } from './config/db';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'HealSync API is running' });
});

// ---------------------------------------------------------------------------
// Route mounts (uncomment as each phase is completed)
// ---------------------------------------------------------------------------
// app.use('/api/auth',            authRoutes);
// app.use('/api/profile',         profileRoutes);
// app.use('/api/checkins',        checkinRoutes);
// app.use('/api/recommendations', recommendationRoutes);
// app.use('/api/journal',         journalRoutes);
// app.use('/api/dashboard',       dashboardRoutes);
// app.use('/api/analytics',       analyticsRoutes);

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'internal_server_error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message,
  });
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🌿 HealSync server running on http://localhost:${PORT}`);
  });
});
