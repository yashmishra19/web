import mongoose, { Document, Schema, model } from 'mongoose'

export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId
  content: string
  moodTag: number | null
  date: Date
  createdAt: Date
  updatedAt: Date
}

const JournalEntrySchema = new Schema<IJournalEntry>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 5000,
  },
  moodTag: {
    type: Number, min: 1, max: 5, default: null
  },
  date: { type: Date, required: true },
}, { timestamps: true })

JournalEntrySchema.index({ userId: 1, date: -1 })

export default model<IJournalEntry>(
  'JournalEntry', JournalEntrySchema
)
