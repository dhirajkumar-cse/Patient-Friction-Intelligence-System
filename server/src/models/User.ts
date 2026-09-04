import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'patient' | 'hospital' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  avatarUrl?: string;
  preferredLanguage: string;
  preferredDialect: string;
  simpleLanguageMode: boolean;
  voiceEnabled: boolean;
  textToSpeechEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['patient', 'hospital', 'admin'],
      default: 'patient',
      required: true,
      index: true,
    },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    avatarUrl: { type: String },
    preferredLanguage: { type: String, default: 'en', index: true },
    preferredDialect: { type: String, default: 'standard' },
    simpleLanguageMode: { type: Boolean, default: false },
    voiceEnabled: { type: Boolean, default: true },
    textToSpeechEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
