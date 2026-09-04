import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRiskFactor {
  factorName: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  operationalImpact: string;
}

export interface ICareRisk extends Document {
  patientId: Types.ObjectId;
  frictionProfileId?: Types.ObjectId;
  careCompletionProbability: number; // 0 to 100%
  accessibilityRiskPercentage: number; // 100 - careCompletionProbability%
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  bottleneckStage: string;
  primaryRiskFactors: IRiskFactor[];
  mitigationPathways: string[];
  disclaimer: string;
  evaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RiskFactorSchema = new Schema<IRiskFactor>(
  {
    factorName: { type: String, required: true },
    severity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], default: 'MODERATE' },
    operationalImpact: { type: String, required: true },
  },
  { _id: false }
);

const CareRiskSchema = new Schema<ICareRisk>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    frictionProfileId: { type: Schema.Types.ObjectId, ref: 'FrictionProfile' },
    careCompletionProbability: { type: Number, required: true, min: 0, max: 100 },
    accessibilityRiskPercentage: { type: Number, required: true, min: 0, max: 100 },
    riskCategory: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'LOW',
      index: true,
    },
    bottleneckStage: { type: String, required: true },
    primaryRiskFactors: { type: [RiskFactorSchema], default: [] },
    mitigationPathways: { type: [String], default: [] },
    disclaimer: {
      type: String,
      default:
        'Estimated operational accessibility index based on socio-geographic friction factors. This is NOT a clinical diagnosis or medical prediction.',
    },
    evaluatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CareRisk = mongoose.model<ICareRisk>('CareRisk', CareRiskSchema);
