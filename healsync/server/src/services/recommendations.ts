import { IDailyCheckIn } from '../models/DailyCheckIn'
import { IUserProfile }  from '../models/UserProfile'

interface RecommendationInput {
  recentCheckIns: Partial<IDailyCheckIn>[]
  profile: Partial<IUserProfile> | null
  userId: string
}

interface RuleOutput {
  category: string
  title: string
  description: string
  actionLabel: string
  priority: 'low' | 'medium' | 'high'
  supportFlag: boolean
}

function avg(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export class RecommendationEngine {

  generate(input: RecommendationInput): RuleOutput[] {
    const results: RuleOutput[] = []
    const { recentCheckIns, profile } = input

    if (!recentCheckIns.length) {
      return this.defaultRecs()
    }

    const last7 = recentCheckIns.slice(0, 7)

    const avgSleep    = avg(last7.map(c => c.sleepHours    || 0))
    const avgStress   = avg(last7.map(c => c.stress        || 3))
    const avgMood     = avg(last7.map(c => c.mood          || 3))
    const avgWater    = avg(last7.map(c => c.waterIntakeLiters || 0))
    const avgActivity = avg(last7.map(c => c.stepsOrMinutes || 0))

    // Sleep rules
    if (avgSleep < 6) {
      results.push({
        category: 'sleep',
        priority: 'high',
        supportFlag: false,
        title: 'Improve your sleep routine',
        description: `You have averaged only
          ${avgSleep.toFixed(1)} hours of sleep
          this week. Try a consistent bedtime and
          avoid screens 30 minutes before sleeping.`,
        actionLabel: 'Start wind-down breathing',
      })
    } else if (avgSleep < 7) {
      results.push({
        category: 'sleep',
        priority: 'medium',
        supportFlag: false,
        title: 'Aim for 7 to 8 hours of sleep',
        description: `Your sleep is slightly below
          target. Try going to bed 30 minutes
          earlier tonight.`,
        actionLabel: 'Try sleep breathing',
      })
    }

    // Hydration rules
    if (avgWater < 1.5) {
      results.push({
        category: 'hydration',
        priority: 'high',
        supportFlag: false,
        title: 'Drink more water urgently',
        description: `Your average water intake is
          only ${avgWater.toFixed(1)}L — well below
          the 2.5L daily goal. Dehydration affects
          energy, mood and concentration.`,
        actionLabel: 'Set water reminder',
      })
    } else if (avgWater < 2.5) {
      results.push({
        category: 'hydration',
        priority: 'medium',
        supportFlag: false,
        title: 'Increase your water intake',
        description: `You are drinking
          ${avgWater.toFixed(1)}L per day on average.
          Try keeping a water bottle at your desk.`,
        actionLabel: 'Log water intake',
      })
    }

    // Stress rules
    if (avgStress >= 4) {
      results.push({
        category: 'stress',
        priority: 'high',
        supportFlag: false,
        title: 'High stress detected',
        description: `Your stress levels have been
          elevated all week (avg
          ${avgStress.toFixed(1)}/5). Try a 5-minute
          breathing exercise today.`,
        actionLabel: 'Start breathing exercise',
      })
    } else if (avgStress >= 3) {
      results.push({
        category: 'stress',
        priority: 'medium',
        supportFlag: false,
        title: 'Take a mindful break',
        description: `Your stress is moderate this
          week. A short walk or breathing exercise
          can reset your nervous system quickly.`,
        actionLabel: 'Try box breathing',
      })
    }

    // Mood rules
    const lowMoodDays = last7.filter(
      c => (c.mood || 3) <= 2
    ).length

    if (lowMoodDays >= 3) {
      results.push({
        category: 'mental_health',
        priority: 'high',
        supportFlag: true,
        title: 'Your mood needs attention',
        description: `Your mood has been low for
          ${lowMoodDays} of the last 7 days.
          Writing in your journal can help. If this
          persists please speak to someone you trust.`,
        actionLabel: 'Open journal',
      })
    } else if (avgMood < 3) {
      results.push({
        category: 'mental_health',
        priority: 'medium',
        supportFlag: false,
        title: 'Boost your mood today',
        description: `Your mood has been below
          average this week. A walk, calling a friend,
          or journaling can make a real difference.`,
        actionLabel: 'Browse self-care tips',
      })
    }

    // Activity rules
    if (avgActivity < 15) {
      results.push({
        category: 'activity',
        priority: 'high',
        supportFlag: false,
        title: 'Move your body today',
        description: `You have been averaging less
          than 15 minutes of activity per day. Even
          a 10-minute walk significantly improves
          mood, sleep and energy.`,
        actionLabel: 'Log activity',
      })
    } else if (avgActivity < 30) {
      results.push({
        category: 'activity',
        priority: 'low',
        supportFlag: false,
        title: 'Add a short stretch session',
        description: `You are close to the 30-minute
          daily activity goal. Try adding a 10-minute
          stretch or walk to reach it.`,
        actionLabel: 'Log activity',
      })
    }

    // Goal-based rules
    if (
      profile?.mainGoal === 'improve_focus' &&
      (profile.workStudyHours || 0) > 8
    ) {
      results.push({
        category: 'focus',
        priority: 'medium',
        supportFlag: false,
        title: 'Take regular focus breaks',
        description: `With ${profile.workStudyHours}+
          hours of work or study daily, try the
          Pomodoro technique: 25 minutes focus,
          5 minutes rest.`,
        actionLabel: 'Try breathing break',
      })
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return results
      .sort((a, b) =>
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
      )
      .slice(0, 5)
  }

  private defaultRecs(): RuleOutput[] {
    return [
      {
        category: 'hydration',
        priority: 'medium',
        supportFlag: false,
        title: 'Stay hydrated today',
        description:
          'Aim for 2.5L of water throughout the day.',
        actionLabel: 'Log check-in',
      },
      {
        category: 'activity',
        priority: 'low',
        supportFlag: false,
        title: 'Start with a short walk',
        description:
          'Even 10 minutes of walking boosts mood.',
        actionLabel: 'Log activity',
      },
    ]
  }
}

export const recommendationEngine =
  new RecommendationEngine()
