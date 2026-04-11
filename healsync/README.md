# HealSync 🌿

> Personalized health recommendations +
> continuous mental wellbeing support.
> Built for Hackathon 2026.

## Quick Start

### Frontend only (works without backend)
  cd client
  npm install
  npm run dev
  Open: http://localhost:5173
  Demo: demo@healsync.app / demo1234

### Full stack
  Terminal 1 (backend):
    cd BACKEND
    npm install
    copy .env.example .env
    (fill MONGODB_URI and JWT_SECRET in .env)
    npm run seed
    npm run dev

  Terminal 2 (frontend):
    cd client
    npm install
    npm run dev

## Environment Setup

BACKEND/.env:
  PORT=3000
  NODE_ENV=development
  MONGODB_URI=mongodb://localhost:27017/healsync
  JWT_SECRET=any_long_random_string_here
  JWT_EXPIRES_IN=7d
  CLIENT_URL=http://localhost:5173

client/.env:
  VITE_API_URL=/api

## Tech Stack
  Frontend:  React + TypeScript + Vite + Tailwind CSS
  Backend:   Node.js + Express + TypeScript
  Database:  MongoDB + Mongoose
  Auth:      JWT
  Charts:    Recharts
  Icons:     Lucide React

## Features
  Daily health check-ins with live wellness score
  Personalized AI-powered recommendations
  Guided breathing exercises (4 techniques)
  Private journaling with mood tracking
  Mood history calendar
  Analytics and trend charts (4 types)
  Dark mode support
  Offline mode with mock data fallback
  Streak tracking system
  AI wellness chatbot (beta)
  Self-care suggestions
  Support resources and helplines

## Team
  BE1: Backend Dev 1
  BE2: Backend Dev 2
  FE1: Frontend Dev 1
  FE2: Frontend Dev 2

## Demo Flow (5 minutes)

Step 1 — Landing page (30 seconds)
  Open http://localhost:5173
  Point out: "No ads, data stays on device"
  Point out: Connected/Offline indicator in topbar
  Click "Get started free"

Step 2 — Onboarding (45 seconds)
  Fill in 5 steps quickly
  Show goal selection cards on step 4
  Show summary card on step 5
  Click "Complete setup"

Step 3 — Dashboard (60 seconds)
  Show wellness score ring animating
  Show sleep chart with colored bars
  Show recommendation cards
  Show streak widget with weekly dots
  Point out green "Connected" indicator

Step 4 — Check-in (45 seconds)
  Click "Log today's check-in"
  Move sliders to show live score updating
  Submit — show success screen with score
  Show streak toast notification

Step 5 — Analytics (30 seconds)
  Show 4 charts
  Switch 7d to 30d — show more data
  Point out clear upward wellness trend

Step 6 — Breathing (30 seconds)
  Select 4-7-8 breathing
  Click Start — show animated circle
  Show phase changing with countdown

Step 7 — Journal (20 seconds)
  Click "New entry"
  Show prompt chips
  Select a mood emoji

Step 8 — AI Chat (20 seconds)
  Ask "I feel stressed"
  Show typing indicator
  Show detailed response

Step 9 — Dark mode (10 seconds)
  Click moon icon in topbar
  Show entire app in dark mode

## Disclaimer
  HealSync is not a medical device and does
  not provide medical advice. Always consult
  a qualified healthcare professional for
  medical concerns.
