import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import dns from 'dns'
import bcrypt from 'bcryptjs'
import {
  User,
  UserProfile,
  DailyCheckIn,
  JournalEntry,
} from '../models'
import { computeWellnessScore } from '../services/wellness'

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not set in .env')
    process.exit(1)
  }

  // Fix querySrv ECONNREFUSED on Node.js v24 Windows
  dns.setServers(['8.8.8.8', '8.8.4.4'])
  await mongoose.connect(uri, { family: 4 })
  console.log('✅ Connected to MongoDB')

  const existing = await User.findOne({
    email: 'demo@healsync.app',
  })
  if (existing) {
    await Promise.all([
      DailyCheckIn.deleteMany({ userId: existing._id }),
      JournalEntry.deleteMany({ userId: existing._id }),
      UserProfile.deleteOne({ userId: existing._id }),
      User.deleteOne({ _id: existing._id }),
    ])
    console.log('🗑️  Cleared old demo data')
  }

  const hashedPassword = await bcrypt.hash('demo1234', 12)
  const user = await User.create({
    name:                   'Alex Johnson',
    email:                  'demo@healsync.app',
    password:               hashedPassword,
    hasCompletedOnboarding: true,
    streakCount:            12,
    lastCheckInDate:        new Date(),
    role:                   'user',
  })
  console.log('👤 Demo user created')

  await UserProfile.create({
    userId:             user._id,
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
    existingConditions: '',
  })
  console.log('📋 Profile created')

  const checkIns = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const progress = (29 - i) / 29

    const clamp = (
      v: number, min: number, max: number
    ) => Math.min(max, Math.max(min, v))

    const rand = (range: number) =>
      Math.random() * range * 2 - range

    const mood   = clamp(
      Math.round(2 + progress * 2 + rand(0.4)), 1, 5
    )
    const stress = clamp(
      Math.round(4 - progress * 2 + rand(0.4)), 1, 5
    )
    const sleep  = Math.round(
      (5 + progress * 3 + rand(0.5)) * 2
    ) / 2
    const water  = Math.round(
      (1.5 + progress * 1 + rand(0.25)) * 4
    ) / 4
    const activity = clamp(
      Math.round(10 + progress * 30 + rand(5)), 0, 120
    )
    const energy = clamp(
      Math.round(2 + progress * 2 + rand(0.4)), 1, 5
    )

    const data = {
      userId:            user._id,
      mood:              clamp(mood, 1, 5),
      stress:            clamp(stress, 1, 5),
      sleepHours:        clamp(sleep, 0, 12),
      waterIntakeLiters: clamp(water, 0, 5),
      stepsOrMinutes:    activity,
      energyLevel:       clamp(energy, 1, 5),
      notes:             '',
      date,
      wellnessScore:     0,
    }

    data.wellnessScore = computeWellnessScore(data)
    checkIns.push(data)
  }

  await DailyCheckIn.insertMany(checkIns)
  console.log('📊 30 days of check-ins created')

  await JournalEntry.insertMany([
    {
      userId:  user._id,
      content: `Feeling really overwhelmed with work today. Deadlines are piling up and I cannot seem to focus. Going to try the breathing exercise tonight before bed.`,
      moodTag: 2,
      date:    new Date(Date.now() - 14 * 86400000),
    },
    {
      userId:  user._id,
      content: `Better day today. Went for a walk at lunch which really helped clear my head. Still stressed but managing it better. Small wins matter.`,
      moodTag: 3,
      date:    new Date(Date.now() - 10 * 86400000),
    },
    {
      userId:  user._id,
      content: `Grateful for: 1. Morning coffee. 2. My team helping me debug that issue. 3. Almost weekend. Trying to focus on positives more.`,
      moodTag: 3,
      date:    new Date(Date.now() - 7 * 86400000),
    },
    {
      userId:  user._id,
      content: `Got 8 hours of sleep for the first time in weeks! Woke up actually feeling refreshed. Wellness score hit 78 today. Keep this up!`,
      moodTag: 4,
      date:    new Date(Date.now() - 4 * 86400000),
    },
    {
      userId:  user._id,
      content: `Noticing patterns now. I feel worse when I skip breakfast and do not drink water. Going to focus on those two things this week.`,
      moodTag: 4,
      date:    new Date(Date.now() - 1 * 86400000),
    },
  ])
  console.log('📔 Journal entries created')

  console.log('\n✅ Demo data seeded successfully!')
  console.log('   Email:    demo@healsync.app')
  console.log('   Password: demo1234')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
