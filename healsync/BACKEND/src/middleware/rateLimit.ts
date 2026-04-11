import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Higher limit in dev so tests don't get blocked;
  // drop to 10 for production
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  message: {
    error: 'Too many requests',
    message: 'Too many attempts. Try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please slow down.',
  },
})
