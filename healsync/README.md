# HealSync

> Personalized health recommendations + continuous mental wellbeing support.

## Team structure

| Role | Phases |
|------|--------|
| BE1 — Backend Dev 1 | Auth APIs, recommendation engine, seed data, deploy |
| BE2 — Backend Dev 2 | MongoDB models, check-in APIs, analytics APIs, safety logic |
| FE1 — Frontend Dev 1 | Auth pages, dashboard layout, charts, dark mode |
| FE2 — Frontend Dev 2 | Design system, onboarding, check-in UI, breathing, chatbot UI |

## Prerequisites

- Node.js v20+
- A free MongoDB Atlas cluster (https://cloud.mongodb.com)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd healsync
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit server/.env with your MongoDB URI and a JWT secret
```

### 3. Run in development

```bash
npm run dev
# Backend:  http://localhost:3000
# Frontend: http://localhost:5173
```

### 4. Seed demo data (after Phase 17)

```bash
npm run seed
```

## API health check

```
GET http://localhost:3000/api/health
```

Expected response:

```json
{ "status": "ok", "message": "HealSync API is running" }
```

## Folder structure

```
healsync/
├── package.json                          ← root, runs both servers via concurrently
├── README.md                             ← setup instructions
├── shared/
│   └── types.ts                          ← ALL shared TypeScript interfaces
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .gitignore
│   └── src/
│       ├── index.ts                      ← Express app entry point
│       └── config/
│           └── db.ts                     ← MongoDB connection
└── client/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    ├── .gitignore
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── context/
        │   ├── AuthContext.tsx
        │   └── ThemeContext.tsx
        ├── api/
        │   └── client.ts
        ├── components/
        │   ├── ProtectedRoute.tsx
        │   └── ui/
        │       ├── LoadingScreen.tsx
        │       ├── Spinner.tsx
        │       ├── Button.tsx
        │       ├── Input.tsx
        │       ├── Card.tsx
        │       ├── Badge.tsx
        │       └── DisclaimerBanner.tsx
        └── pages/
            ├── LoginPage.tsx
            ├── SignupPage.tsx
            ├── OnboardingPage.tsx
            ├── DashboardPage.tsx
            ├── CheckInPage.tsx
            ├── JournalPage.tsx
            ├── BreathingPage.tsx
            ├── AnalyticsPage.tsx
            ├── SettingsPage.tsx
            └── NotFoundPage.tsx
```

## Environment variables

### `server/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the Express server listens on | `3000` |
| `NODE_ENV` | Runtime environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret used to sign JWT tokens (keep private) | `your_super_secret_jwt_key_here` |
| `JWT_EXPIRES_IN` | How long a JWT token remains valid | `7d` |
| `CLIENT_URL` | Allowed CORS origin (your frontend URL) | `http://localhost:5173` |

### `client/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for API requests | `/api` |

## Disclaimer

HealSync is not a medical device and does not provide medical advice. It provides general wellness guidance only and is not a substitute for professional medical, psychiatric, or therapeutic care. If you are in distress, please contact a qualified healthcare provider or a crisis helpline.
