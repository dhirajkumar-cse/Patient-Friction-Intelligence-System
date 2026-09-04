import mongoose, { Document, Schema, Types } from 'mongoose';

export type DocumentType = 'Prescription' | 'Medical Report' | 'Referral' | 'ID Card' | 'Other';

export interface IPatientDocument extends Document {
  patientId: Types.ObjectId;
  title: string;
  type: DocumentType;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: Date;
  notes?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatientDocumentSchema = new Schema<IPatientDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Prescription', 'Medical Report', 'Referral', 'ID Card', 'Other'],
      default: 'Medical Report',
      index: true,
    },
    originalFilename: { type: String, required: true },
    storedFilename: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
    notes: { type: String },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PatientDocument = mongoose.model<IPatientDocument>(
  'PatientDocument',
  PatientDocumentSchema
);
