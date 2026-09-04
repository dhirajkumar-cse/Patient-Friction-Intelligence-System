import mongoose, { Document, Schema, Types } from 'mongoose';

export type ConsentStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING';

export interface IConsent extends Document {
  patientId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  dataShared: string[]; // e.g. ['name_and_age', 'contact_info', 'reason_for_visit', 'accessibility_barriers', 'documents']
  purpose: string;
  status: ConsentStatus;
  grantedAt: Date;
  revokedAt?: Date;
  expiresAt?: Date;
  termsVersion: string;
  ipAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    dataShared: {
      type: [String],
      default: ['demographics', 'reason_for_visit', 'accessibility_friction', 'uploaded_documents'],
    },
    purpose: {
      type: String,
      default: 'Care Access Facilitation and Hospital Appointment Scheduling',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'REVOKED', 'EXPIRED', 'PENDING'],
      default: 'ACTIVE',
      index: true,
    },
    grantedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
    expiresAt: { type: Date },
    termsVersion: { type: String, default: 'v1.0-2026' },
    ipAddress: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Consent = mongoose.model<IConsent>('Consent', ConsentSchema);
