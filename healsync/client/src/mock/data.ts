import type {
  PublicUser,
  UserProfile,
  CheckIn,
  Recommendation,
  JournalEntry,
  DashboardSummary,
  AnalyticsData,
} from '@shared/types';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function generateDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export const MOCK_USER: PublicUser = {
  id:                     'mock-user-1',
  email:                  'demo@healsync.app',
  name:                   'Alex Johnson',
  hasCompletedOnboarding: true,
  streakCount:            7,
  createdAt:              generateDateString(7),
};

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const MOCK_PROFILE: UserProfile = {
  id:                 'mock-profile-1',
  userId:             'mock-user-1',
  age:                27,
  gender:             'prefer_not_to_say',
  heightCm:           170,
  weightKg:           68,
  sleepHours:         6.5,
  activityLevel:      'lightly_active',
  waterIntakeLiters:  1.8,
  dietPreference:     'omnivore',
  stressLevel:        3,
  moodBaseline:       3,
  workStudyHours:     9,
  mainGoal:           'reduce_stress',
  existingConditions: [],
  createdAt:          generateDateString(7),
  updatedAt:          generateDateString(0),
};

// ---------------------------------------------------------------------------
// Check-ins (14 days, index 0 = today)
// ---------------------------------------------------------------------------

const rawCheckins = [
  { mood: 3, sleep: 6.0, stress: 3, water: 1.8, steps: 20, energy: 3, score: 62, notes: ''   },
  { mood: 2, sleep: 5.5, stress: 4, water: 1.6, steps: 15, energy: 2, score: 52, notes: ''   },
  { mood: 4, sleep: 7.5, stress: 2, water: 2.2, steps: 35, energy: 4, score: 75, notes: 'Felt a bit tired but managed to go for a short walk.'   },
  { mood: 3, sleep: 6.5, stress: 3, water: 2.0, steps: 25, energy: 3, score: 64, notes: ''   },
  { mood: 2, sleep: 5.5, stress: 4, water: 1.5, steps: 10, energy: 2, score: 50, notes: ''   },
  { mood: 4, sleep: 7.0, stress: 2, water: 2.4, steps: 40, energy: 4, score: 76, notes: 'Had a stressful day at work, tried some deep breathing.' },
  { mood: 3, sleep: 6.0, stress: 3, water: 1.9, steps: 20, energy: 3, score: 61, notes: ''   },
  { mood: 2, sleep: 5.5, stress: 4, water: 1.7, steps: 15, energy: 2, score: 53, notes: ''   },
  { mood: 4, sleep: 8.0, stress: 2, water: 2.3, steps: 45, energy: 4, score: 78, notes: 'Great day overall, energy levels were high.' },
  { mood: 3, sleep: 6.5, stress: 3, water: 2.0, steps: 30, energy: 3, score: 65, notes: ''   },
  { mood: 2, sleep: 5.5, stress: 4, water: 1.6, steps: 10, energy: 2, score: 51, notes: ''   },
  { mood: 4, sleep: 7.5, stress: 2, water: 2.5, steps: 35, energy: 4, score: 77, notes: ''   },
  { mood: 3, sleep: 6.0, stress: 3, water: 1.8, steps: 20, energy: 3, score: 63, notes: ''   },
  { mood: 2, sleep: 5.5, stress: 4, water: 1.5, steps: 15, energy: 2, score: 55, notes: ''   },
];

export const MOCK_CHECKINS: CheckIn[] = rawCheckins.map((c, i) => ({
  id:                 `checkin-${i}`,
  userId:             'mock-user-1',
  mood:               c.mood,
  stress:             c.stress,
  sleepHours:         c.sleep,
  waterIntakeLiters:  c.water,
  stepsOrMinutes:     c.steps,
  energyLevel:        c.energy,
  notes:              c.notes,
  wellnessScore:      c.score,
  date:               generateDateString(i),
  createdAt:          generateDateString(i),
}));

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id:          'rec-1',
    userId:      'mock-user-1',
    category:    'sleep',
    priority:    'high',
    supportFlag: false,
    title:       'Improve your sleep routine',
    description: 'You have been sleeping under 7 hours for 5 days. Try a consistent bedtime and avoid screens 30 minutes before sleep.',
    actionLabel: 'Start wind-down routine',
    createdAt:   generateDateString(0),
  },
  {
    id:          'rec-2',
    userId:      'mock-user-1',
    category:    'hydration',
    priority:    'medium',
    supportFlag: false,
    title:       'Drink more water',
    description: 'Your daily water intake is below the recommended 2.5L. Try keeping a bottle at your desk.',
    actionLabel: 'Set water reminder',
    createdAt:   generateDateString(0),
  },
  {
    id:          'rec-3',
    userId:      'mock-user-1',
    category:    'stress',
    priority:    'high',
    supportFlag: false,
    title:       'Try a breathing exercise',
    description: 'Your stress levels have been elevated this week. A 5-minute breathing session can help reset your nervous system.',
    actionLabel: 'Start breathing',
    createdAt:   generateDateString(0),
  },
  {
    id:          'rec-4',
    userId:      'mock-user-1',
    category:    'exercise',
    priority:    'low',
    supportFlag: false,
    title:       'Add a short walk',
    description: 'You logged under 20 minutes of activity today. A 10-minute walk after lunch can boost your mood and energy.',
    actionLabel: 'Log activity',
    createdAt:   generateDateString(0),
  },
  {
    id:          'rec-5',
    userId:      'mock-user-1',
    category:    'mental_health',
    priority:    'medium',
    supportFlag: true,
    title:       'Check in with yourself',
    description: 'Your mood has been lower than usual for a few days. Writing in your journal can help you process your feelings.',
    actionLabel: 'Open journal',
    createdAt:   generateDateString(0),
  },
];

// ---------------------------------------------------------------------------
// Journal entries (5 days, index 0 = today)
// ---------------------------------------------------------------------------

const journalData = [
  {
    content: 'Feeling a bit overwhelmed with work today. Tried to take some breaks and focus on what I can control. Tomorrow will be better.',
    moodTag: '2',
  },
  {
    content: 'Had a decent day. Got outside for a walk which really helped my mood. Noticed I feel much better when I spend even a little time outdoors.',
    moodTag: '4',
  },
  {
    content: 'Struggling with sleep again. Going to try putting my phone away earlier tonight and see if that makes a difference.',
    moodTag: '2',
  },
  {
    content: 'A rare good day! Felt energetic and productive. Made time to cook a healthy meal and actually enjoyed the evening.',
    moodTag: '4',
  },
  {
    content: 'Work stress is building up. Need to find better ways to decompress in the evenings. Maybe try the breathing exercises more consistently.',
    moodTag: '3',
  },
];

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = journalData.map((j, i) => ({
  id:        `journal-${i + 1}`,
  userId:    'mock-user-1',
  content:   j.content,
  moodTag:   j.moodTag,
  date:      generateDateString(i),
  createdAt: generateDateString(i),
  updatedAt: generateDateString(i),
}));

// ---------------------------------------------------------------------------
// Dashboard summary
// ---------------------------------------------------------------------------

export const MOCK_DASHBOARD: DashboardSummary = {
  wellnessScore:     67,
  wellnessStatus:    'needs_attention',
  todayMood:         3,
  streakCount:       7,
  sleepLast7Days:    [6, 7.5, 5.5, 6, 7, 6.5, 5],
  waterToday:        1.8,
  stressToday:       3,
  activityToday:     20,
  recommendations:   MOCK_RECOMMENDATIONS.slice(0, 3),
  hasCheckedInToday: false,
};

// ---------------------------------------------------------------------------
// Analytics (14 days, index 0 = oldest)
// ---------------------------------------------------------------------------

// Reverse of check-ins so oldest data is first (chart left-to-right order)
const reversed = [...rawCheckins].reverse();

export const MOCK_ANALYTICS: AnalyticsData = {
  mood: reversed.map((c, i) => ({
    date:  generateDateString(13 - i),
    value: c.mood,
  })),
  sleep: reversed.map((c, i) => ({
    date:  generateDateString(13 - i),
    value: c.sleep,
  })),
  stress: reversed.map((c, i) => ({
    date:  generateDateString(13 - i),
    value: c.stress,
  })),
  wellness: reversed.map((c, i) => ({
    date:  generateDateString(13 - i),
    value: c.score,
  })),
};
