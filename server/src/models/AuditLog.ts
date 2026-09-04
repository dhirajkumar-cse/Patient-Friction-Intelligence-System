import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorRole: { type: String, default: 'system' },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
