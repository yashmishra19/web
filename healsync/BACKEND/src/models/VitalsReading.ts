import mongoose, { Document, Schema, model } from 'mongoose'

export interface IVitalsReading extends Document {
  userId: mongoose.Types.ObjectId
  heartRate: number | null
  systolicBP: number | null
  diastolicBP: number | null
  spO2: number | null
  steps: number | null
  caloriesBurned: number | null
  bodyTemperature: number | null
  stressLevel: number | null
  sleepHours: number | null
  source: 'manual' | 'smartwatch' | 'simulated'
  recordedAt: Date
  createdAt: Date
  updatedAt: Date
}

const VitalsReadingSchema = new Schema<IVitalsReading>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', required: true,
  },
  heartRate:       { type: Number, min: 40,  max: 200, default: null },
  systolicBP:      { type: Number, min: 70,  max: 200, default: null },
  diastolicBP:     { type: Number, min: 40,  max: 130, default: null },
  spO2:            { type: Number, min: 85,  max: 100, default: null },
  steps:           { type: Number, min: 0,   max: 50000, default: null },
  caloriesBurned:  { type: Number, min: 0,   max: 5000, default: null },
  bodyTemperature: { type: Number, min: 35,  max: 42, default: null },
  stressLevel:     { type: Number, min: 1,   max: 5, default: null },
  sleepHours:      { type: Number, min: 0,   max: 24, default: null },
  source: {
    type: String,
    enum: ['manual', 'smartwatch', 'simulated'],
    default: 'manual',
  },
  recordedAt: { type: Date, required: true },
}, { timestamps: true })

VitalsReadingSchema.index({ userId: 1, recordedAt: -1 })

export default model<IVitalsReading>(
  'VitalsReading', VitalsReadingSchema
)
