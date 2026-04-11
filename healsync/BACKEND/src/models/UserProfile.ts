import mongoose, { Document, Schema, model } from 'mongoose'

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId
  age: number
  gender: 'male'|'female'|'non_binary'|'prefer_not_to_say'
  heightCm: number
  weightKg: number
  sleepHours: number
  activityLevel: 'sedentary'|'lightly_active'|
                 'moderately_active'|'very_active'|'extra_active'
  waterIntakeLiters: number
  dietPreference: 'omnivore'|'vegetarian'|'vegan'|'pescatarian'|
                  'keto'|'paleo'|'gluten_free'|'other'
  stressLevel: number
  moodBaseline: number
  workStudyHours: number
  mainGoal: 'lose_weight'|'gain_muscle'|'improve_sleep'|'reduce_stress'|
            'improve_fitness'|'better_nutrition'|'mental_wellness'|'general_health'
  existingConditions: string[]
  createdAt: Date
  updatedAt: Date
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  age:      {
    type: Number, required: true, min: 13, max: 120
  },
  gender:   {
    type: String, required: true,
    enum: ['male','female','non_binary','prefer_not_to_say'],
  },
  heightCm: {
    type: Number, required: true, min: 50, max: 300
  },
  weightKg: {
    type: Number, required: true, min: 10, max: 500
  },
  sleepHours: {
    type: Number, required: true, min: 0, max: 24
  },
  activityLevel: {
    type: String, required: true,
    enum: ['sedentary','lightly_active',
           'moderately_active','very_active','extra_active'],
  },
  waterIntakeLiters: {
    type: Number, required: true, min: 0, max: 20
  },
  dietPreference: {
    type: String, required: true,
    enum: ['omnivore','vegetarian','vegan','pescatarian',
           'keto','paleo','gluten_free','other'],
  },
  stressLevel: {
    type: Number, required: true, min: 1, max: 5
  },
  moodBaseline: {
    type: Number, required: true, min: 1, max: 5
  },
  workStudyHours: {
    type: Number, required: true, min: 0, max: 24
  },
  mainGoal: {
    type: String, required: true,
    enum: ['lose_weight','gain_muscle','improve_sleep','reduce_stress',
           'improve_fitness','better_nutrition','mental_wellness','general_health'],
  },
  existingConditions: { type: [String], default: [] },
}, { timestamps: true })

export default model<IUserProfile>(
  'UserProfile', UserProfileSchema
)
