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
  streakCount:            9,
  createdAt:              generateDateString(30),
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
  createdAt:          generateDateString(30),
  updatedAt:          generateDateString(0),
};

// ---------------------------------------------------------------------------
// Check-ins (30 days, index 0 = today, index 29 = 29 days ago)
// ---------------------------------------------------------------------------

// We generate 30 days of check-ins.
// Days 30-20 ago (index 29 to 19): lower mood, high stress
// Days 19-10 ago (index 18 to 9): moderate
// Days 9-1 ago (index 8 to 0): improving

const rawCheckins = [
  // Day 0 to 9 ago (Improving)
  { mood: 4, sleep: 7.5, stress: 2, water: 2.5, steps: 40, energy: 4, score: 78, notes: 'Feeling great and energized today.' }, // Day 0 (today)
  { mood: 4, sleep: 8.0, stress: 2, water: 2.2, steps: 35, energy: 4, score: 76, notes: 'Good day overall.' }, // Day 1
  { mood: 3, sleep: 7.0, stress: 3, water: 2.0, steps: 30, energy: 3, score: 72, notes: '' }, // Day 2
  { mood: 4, sleep: 7.5, stress: 2, water: 2.4, steps: 35, energy: 4, score: 77, notes: 'Had a productive morning.' }, // Day 3
  { mood: 3, sleep: 7.0, stress: 3, water: 2.1, steps: 25, energy: 3, score: 70, notes: '' }, // Day 4
  { mood: 4, sleep: 7.5, stress: 2, water: 2.5, steps: 45, energy: 4, score: 79, notes: 'Went for a long walk.' }, // Day 5
  { mood: 3, sleep: 7.0, stress: 3, water: 2.0, steps: 30, energy: 3, score: 71, notes: '' }, // Day 6
  { mood: 3, sleep: 7.5, stress: 2, water: 2.3, steps: 25, energy: 3, score: 74, notes: '' }, // Day 7
  { mood: 3, sleep: 7.0, stress: 3, water: 2.0, steps: 20, energy: 3, score: 69, notes: '' }, // Day 8

  // Day 10 to 19 ago (Moderate)
  { mood: 3, sleep: 6.5, stress: 3, water: 1.8, steps: 20, energy: 3, score: 65, notes: '' }, // Day 9
  { mood: 3, sleep: 6.0, stress: 3, water: 1.9, steps: 25, energy: 3, score: 64, notes: '' }, // Day 10
  { mood: 2, sleep: 5.5, stress: 4, water: 1.6, steps: 15, energy: 2, score: 55, notes: 'Tough day' }, // Day 11
  { mood: 3, sleep: 6.5, stress: 3, water: 2.0, steps: 20, energy: 3, score: 66, notes: '' }, // Day 12
  { mood: 3, sleep: 7.0, stress: 3, water: 1.8, steps: 25, energy: 3, score: 67, notes: '' }, // Day 13
  { mood: 2, sleep: 6.0, stress: 4, water: 1.5, steps: 15, energy: 2, score: 56, notes: '' }, // Day 14
  { mood: 3, sleep: 6.5, stress: 3, water: 1.9, steps: 20, energy: 3, score: 65, notes: '' }, // Day 15
  { mood: 3, sleep: 6.0, stress: 3, water: 1.8, steps: 25, energy: 3, score: 64, notes: '' }, // Day 16
  { mood: 3, sleep: 6.5, stress: 3, water: 1.7, steps: 20, energy: 3, score: 63, notes: '' }, // Day 17
  { mood: 2, sleep: 5.5, stress: 4, water: 1.6, steps: 15, energy: 2, score: 54, notes: '' }, // Day 18

  // Day 20 to 30 ago (Lower mood, high stress)
  { mood: 2, sleep: 6.0, stress: 4, water: 1.5, steps: 15, energy: 2, score: 53, notes: '' }, // Day 19
  { mood: 2, sleep: 5.5, stress: 4, water: 1.6, steps: 10, energy: 2, score: 50, notes: 'Feeling overwhelmed.' }, // Day 20
  { mood: 3, sleep: 6.0, stress: 4, water: 1.5, steps: 15, energy: 3, score: 52, notes: '' }, // Day 21
  { mood: 2, sleep: 5.0, stress: 5, water: 1.4, steps: 10, energy: 2, score: 45, notes: 'Very stressed' }, // Day 22
  { mood: 2, sleep: 5.5, stress: 4, water: 1.5, steps: 15, energy: 2, score: 51, notes: '' }, // Day 23
  { mood: 2, sleep: 5.0, stress: 4, water: 1.6, steps: 10, energy: 1, score: 48, notes: '' }, // Day 24
  { mood: 3, sleep: 6.0, stress: 3, water: 1.7, steps: 15, energy: 3, score: 55, notes: '' }, // Day 25
  { mood: 2, sleep: 5.5, stress: 4, water: 1.5, steps: 10, energy: 2, score: 49, notes: '' }, // Day 26
  { mood: 2, sleep: 5.0, stress: 5, water: 1.4, steps: 10, energy: 1, score: 44, notes: 'Could not sleep well.' }, // Day 27
  { mood: 3, sleep: 6.0, stress: 4, water: 1.6, steps: 15, energy: 3, score: 53, notes: '' }, // Day 28
  { mood: 2, sleep: 5.5, stress: 4, water: 1.5, steps: 10, energy: 2, score: 47, notes: '' }  // Day 29
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
// Journal entries (8 days, index 0 = today)
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
  {
    content: 'Started reading a new book. It really helped to distract me from the usual worries.',
    moodTag: '3',
  },
  {
    content: 'Feeling quite anxious today, finding it hard to pinpoint why. Just need to take it one step at a time.',
    moodTag: '2',
  },
  {
    content: 'Had a great conversation with a friend today. Amazing how a simple catch-up can lift your spirits!',
    moodTag: '5',
  }
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
  wellnessScore:     72,
  wellnessStatus:    'improving',
  todayMood:         4,
  streakCount:       9,
  sleepLast7Days:    [6.0, 7.5, 7.0, 7.5, 7.0, 8.0, 7.5], // Days 6 to 0
  waterToday:        2.5,
  stressToday:       2,
  activityToday:     40,
  recommendations:   MOCK_RECOMMENDATIONS.slice(0, 3),
  hasCheckedInToday: false,
};

// ---------------------------------------------------------------------------
// Analytics (30 days, index 0 = oldest)
// ---------------------------------------------------------------------------

// Reverse of check-ins so oldest data is first (chart left-to-right order)
const reversed = [...rawCheckins].reverse();

export const MOCK_ANALYTICS: AnalyticsData = {
  mood: reversed.map((c, i) => ({
    date:  generateDateString(29 - i),
    value: c.mood,
  })),
  sleep: reversed.map((c, i) => ({
    date:  generateDateString(29 - i),
    value: c.sleep,
  })),
  stress: reversed.map((c, i) => ({
    date:  generateDateString(29 - i),
    value: c.stress,
  })),
  wellness: reversed.map((c, i) => ({
    date:  generateDateString(29 - i),
    value: c.score,
  })),
};
