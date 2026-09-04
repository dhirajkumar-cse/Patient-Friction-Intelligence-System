import mongoose, { Document, Schema } from 'mongoose';

export interface IFunnelMilestone {
  stageName: string; // "Referred", "Consulted", "Diagnosed", "Treatment Started", "Treatment Completed", "Follow-up Completed"
  patientCount: number;
  retentionPercentage: number;
  dropOffCount: number;
  dropOffPercentage: number;
  primaryBarrierCausingDropOff: string;
}

export interface ICareLeakage extends Document {
  cohortName: string; // e.g. "Q1-2026 Regional Cohort"
  totalReferred: number;
  funnelMilestones: IFunnelMilestone[];
  highestLeakageStage: string;
  totalLeakagePercentage: number;
  observedPeriod: string;
  createdAt: Date;
  updatedAt: Date;
}

const FunnelMilestoneSchema = new Schema<IFunnelMilestone>(
  {
    stageName: { type: String, required: true },
    patientCount: { type: Number, required: true },
    retentionPercentage: { type: Number, required: true },
    dropOffCount: { type: Number, required: true },
    dropOffPercentage: { type: Number, required: true },
    primaryBarrierCausingDropOff: { type: String, required: true },
  },
  { _id: false }
);

const CareLeakageSchema = new Schema<ICareLeakage>(
  {
    cohortName: { type: String, required: true },
    totalReferred: { type: Number, required: true, default: 1000 },
    funnelMilestones: { type: [FunnelMilestoneSchema], default: [] },
    highestLeakageStage: { type: String, default: 'Treatment Started -> Treatment Completed' },
    totalLeakagePercentage: { type: Number, default: 82.0 },
    observedPeriod: { type: String, default: 'Last 90 Days' },
  },
  { timestamps: true }
);

export const CareLeakage = mongoose.model<ICareLeakage>('CareLeakage', CareLeakageSchema);
