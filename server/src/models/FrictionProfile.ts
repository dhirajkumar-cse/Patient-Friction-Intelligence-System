import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFrictionFactor {
  dimension: string;
  score: number; // 0 to 100 (100 = maximum friction/barrier)
  weight: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  contributingParameters: Record<string, any>;
}

export interface IFrictionProfile extends Document {
  patientId: Types.ObjectId;
  hospitalId?: Types.ObjectId;
  travel: IFrictionFactor;
  transport: IFrictionFactor;
  digitalAccess: IFrictionFactor;
  language: IFrictionFactor;
  familySupport: IFrictionFactor;
  documentation: IFrictionFactor;
  cost: IFrictionFactor;
  appointmentTiming: IFrictionFactor;
  
  overallFrictionScore: number; // 0 to 100
  overallAccessibilityScore: number; // 100 - overallFrictionScore
  frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  topBarrier: string;
  secondaryBarrier: string;
  explanation: string;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FrictionFactorSchema = new Schema<IFrictionFactor>(
  {
    dimension: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, default: 1.0 },
    level: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    reason: { type: String, required: true },
    contributingParameters: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const FrictionProfileSchema = new Schema<IFrictionProfile>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    travel: { type: FrictionFactorSchema, required: true },
    transport: { type: FrictionFactorSchema, required: true },
    digitalAccess: { type: FrictionFactorSchema, required: true },
    language: { type: FrictionFactorSchema, required: true },
    familySupport: { type: FrictionFactorSchema, required: true },
    documentation: { type: FrictionFactorSchema, required: true },
    cost: { type: FrictionFactorSchema, required: true },
    appointmentTiming: { type: FrictionFactorSchema, required: true },
    overallFrictionScore: { type: Number, required: true, min: 0, max: 100 },
    overallAccessibilityScore: { type: Number, required: true, min: 0, max: 100 },
    frictionLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
      index: true,
    },
    topBarrier: { type: String, required: true },
    secondaryBarrier: { type: String, required: true },
    explanation: { type: String, required: true },
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FrictionProfile = mongoose.model<IFrictionProfile>(
  'FrictionProfile',
  FrictionProfileSchema
);
