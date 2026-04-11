import mongoose, { Document, Schema, model } from 'mongoose'

export interface IRecommendation extends Document {
  userId: mongoose.Types.ObjectId
  category: 'sleep'|'hydration'|'activity'|
            'stress'|'mental_health'|'nutrition'|'focus'
  title: string
  description: string
  actionLabel: string
  priority: 'low'|'medium'|'high'
  supportFlag: boolean
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const RecommendationSchema = new Schema<IRecommendation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', required: true,
  },
  category: {
    type: String, required: true,
    enum: ['sleep','hydration','activity','stress',
           'mental_health','nutrition','focus'],
  },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  actionLabel: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['low','medium','high'],
    default: 'medium',
  },
  supportFlag: { type: Boolean, default: false },
  isRead:      { type: Boolean, default: false },
}, { timestamps: true })

RecommendationSchema.index({ userId: 1, createdAt: -1 })

export default model<IRecommendation>(
  'Recommendation', RecommendationSchema
)
