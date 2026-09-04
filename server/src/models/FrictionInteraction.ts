import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFrictionInteraction extends Document {
  patientId: Types.ObjectId;
  frictionProfileId: Types.ObjectId;
  primaryDimension: string;
  secondaryDimension: string;
  baseScorePrimary: number;
  baseScoreSecondary: number;
  interactionMultiplier: number;
  combinedFrictionScore: number;
  interactionSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'COMPOUND_CRITICAL';
  mechanismExplanation: string;
  recommendedMitigation: string;
  detectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FrictionInteractionSchema = new Schema<IFrictionInteraction>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    frictionProfileId: { type: Schema.Types.ObjectId, ref: 'FrictionProfile', required: true },
    primaryDimension: { type: String, required: true },
    secondaryDimension: { type: String, required: true },
    baseScorePrimary: { type: Number, required: true },
    baseScoreSecondary: { type: Number, required: true },
    interactionMultiplier: { type: Number, required: true, default: 1.0 },
    combinedFrictionScore: { type: Number, required: true },
    interactionSeverity: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'COMPOUND_CRITICAL'],
      default: 'MODERATE',
    },
    mechanismExplanation: { type: String, required: true },
    recommendedMitigation: { type: String, required: true },
    detectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FrictionInteraction = mongoose.model<IFrictionInteraction>(
  'FrictionInteraction',
  FrictionInteractionSchema
);
