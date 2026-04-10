// =============================================================================
// HealSync — Shared TypeScript Interfaces
// Importable from both server/src/ and client/src/
// =============================================================================

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  hasCompletedOnboarding: boolean;
  streakCount: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

export type DietPreference =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'gluten_free'
  | 'other';

export type HealthGoal =
  | 'lose_weight'
  | 'gain_muscle'
  | 'improve_sleep'
  | 'reduce_stress'
  | 'improve_fitness'
  | 'better_nutrition'
  | 'mental_wellness'
  | 'general_health';

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';

export interface OnboardingPayload {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  sleepHours: number;
  activityLevel: ActivityLevel;
  waterIntakeLiters: number;
  dietPreference: DietPreference;
  stressLevel: number;       // 1–10
  moodBaseline: number;      // 1–10
  workStudyHours: number;
  mainGoal: HealthGoal;
  existingConditions?: string[];
}

export interface UserProfile extends OnboardingPayload {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Check-In
// ---------------------------------------------------------------------------

export interface CheckInPayload {
  mood: number;                  // 1–10
  stress: number;                // 1–10
  sleepHours: number;
  waterIntakeLiters: number;
  stepsOrMinutes: number;
  energyLevel: number;           // 1–10
  notes?: string;
  date?: string;                 // ISO date string — defaults to today
}

export interface CheckIn extends CheckInPayload {
  id: string;
  userId: string;
  wellnessScore: number;         // computed by server
  date: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export type RecommendationCategory =
  | 'sleep'
  | 'nutrition'
  | 'hydration'
  | 'exercise'
  | 'stress'
  | 'mental_health'
  | 'breathing'
  | 'journaling'
  | 'social'
  | 'general';

export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Recommendation {
  id: string;
  userId: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  actionLabel?: string;
  priority: RecommendationPriority;
  supportFlag: boolean;          // true = flag for professional support
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

export interface JournalEntryPayload {
  content: string;
  moodTag?: string;
  date?: string;                 // ISO date string — defaults to today
}

export interface JournalEntry extends JournalEntryPayload {
  id: string;
  userId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type WellnessStatus = 'improving' | 'stable' | 'needs_attention';

export interface DashboardSummary {
  wellnessScore: number;
  wellnessStatus: WellnessStatus;
  todayMood: number | null;
  streakCount: number;
  sleepLast7Days: number[];
  waterToday: number;
  stressToday: number | null;
  activityToday: number | null;
  recommendations: Recommendation[];
  hasCheckedInToday: boolean;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface AnalyticsData {
  mood: TimeSeriesPoint[];
  sleep: TimeSeriesPoint[];
  stress: TimeSeriesPoint[];
  wellness: TimeSeriesPoint[];
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export interface ReminderSettings {
  checkInEnabled: boolean;
  checkInTime: string;           // HH:MM format
  waterEnabled: boolean;
  waterIntervalHours: number;
  sleepEnabled: boolean;
  sleepTime: string;             // HH:MM format
  stretchEnabled: boolean;
  stretchTime: string;           // HH:MM format
}

// ---------------------------------------------------------------------------
// API Wrappers
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
}
