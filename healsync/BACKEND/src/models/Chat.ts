import mongoose, { Document, Schema, model } from 'mongoose'

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId
  role: 'user' | 'model' | 'system'
  text: string
  timestamp: Date
}

const ChatSchema = new Schema<IChat>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'model', 'system'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default model<IChat>('Chat', ChatSchema)
