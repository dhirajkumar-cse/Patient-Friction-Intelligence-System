import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'REQUEST_UPDATE'
  | 'NEW_REQUEST'
  | 'CONSENT_UPDATE'
  | 'DOCUMENT_ALERT'
  | 'SYSTEM_ALERT';

export interface INotification extends Document {
  userId: Types.ObjectId;
  role: 'patient' | 'hospital' | 'admin';
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: Types.ObjectId;
  relatedType?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['patient', 'hospital', 'admin'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['REQUEST_UPDATE', 'NEW_REQUEST', 'CONSENT_UPDATE', 'DOCUMENT_ALERT', 'SYSTEM_ALERT'],
      default: 'SYSTEM_ALERT',
    },
    relatedId: { type: Schema.Types.ObjectId },
    relatedType: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    actionUrl: { type: String },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
