import mongoose, { Document, Schema, model } from 'mongoose'

export interface IDailyCheckIn extends Document {
  userId: mongoose.Types.ObjectId
  mood: number
  stress: number
  sleepHours: number
  waterIntakeLiters: number
  stepsOrMinutes: number
  energyLevel: number
  notes: string
  wellnessScore: number
  date: Date
  createdAt: Date
  updatedAt: Date
}

const DailyCheckInSchema = new Schema<IDailyCheckIn>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', required: true,
  },
  mood:         { type: Number, required: true, min: 1, max: 5 },
  stress:       { type: Number, required: true, min: 1, max: 5 },
  sleepHours:   { type: Number, required: true, min: 0, max: 24 },
  waterIntakeLiters: {
    type: Number, required: true, min: 0, max: 20
  },
  stepsOrMinutes: { type: Number, required: true, min: 0 },
  energyLevel:  { type: Number, required: true, min: 1, max: 5 },
  notes:        { type: String, default: '' },
  wellnessScore: {
    type: Number, required: true, min: 0, max: 100
  },
  date: { type: Date, required: true },
}, { timestamps: true })

DailyCheckInSchema.index({ userId: 1, date: -1 })
DailyCheckInSchema.index(
  { userId: 1, date: 1 },
  { unique: true }
)

export default model<IDailyCheckIn>(
  'DailyCheckIn', DailyCheckInSchema
)
