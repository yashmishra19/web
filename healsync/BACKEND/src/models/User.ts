import mongoose, { Document, Schema, model } from 'mongoose'
import type { PublicUser } from '../../../shared/types'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  hasCompletedOnboarding: boolean
  streakCount: number
  lastCheckInDate: Date | null
  role: 'user' | 'admin' | 'doctor'
  reminderSettings: {
    checkInEnabled: boolean
    checkInTime: string
    waterEnabled: boolean
    waterIntervalHours: number
    sleepEnabled: boolean
    sleepTime: string
    stretchEnabled: boolean
    stretchTime: string
  }
  createdAt: Date
  updatedAt: Date
  toPublicJSON(): PublicUser
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 60,
  },
  hasCompletedOnboarding: {
    type: Boolean, default: false
  },
  streakCount:     { type: Number, default: 0 },
  lastCheckInDate: { type: Date,   default: null },
  role: {
    type: String,
    enum: ['user', 'admin', 'doctor'],
    default: 'user',
  },
  reminderSettings: {
    checkInEnabled:     { type: Boolean, default: true },
    checkInTime:        { type: String,  default: '09:00' },
    waterEnabled:       { type: Boolean, default: true },
    waterIntervalHours: { type: Number,  default: 2 },
    sleepEnabled:       { type: Boolean, default: false },
    sleepTime:          { type: String,  default: '22:00' },
    stretchEnabled:     { type: Boolean, default: false },
    stretchTime:        { type: String,  default: '15:00' },
  },
}, { timestamps: true })

UserSchema.methods.toPublicJSON = function(): PublicUser {
  return {
    id:                     this._id.toString(),
    email:                  this.email,
    name:                   this.name,
    hasCompletedOnboarding: this.hasCompletedOnboarding,
    streakCount:            this.streakCount,
    createdAt:              this.createdAt.toISOString(),
  }
}

export default model<IUser>('User', UserSchema)
