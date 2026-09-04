import mongoose, { Document, Schema } from 'mongoose';

export interface IIntervention extends Document {
  code: string;
  name: string;
  category: 'Transport' | 'Diagnostics' | 'Community Staff' | 'Digital' | 'Logistics' | 'Administrative';
  description: string;
  targetBarrier: string;
  unitCostINR: number; // Cost in INR
  estimatedCompletionGainPercent: number; // percentage points improvement e.g. 25
  estimatedReachPatients: number;
  costPerPatientINR: number;
  geographicSuitability: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InterventionSchema = new Schema<IIntervention>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Transport', 'Diagnostics', 'Community Staff', 'Digital', 'Logistics', 'Administrative'],
      required: true,
    },
    description: { type: String, required: true },
    targetBarrier: { type: String, required: true },
    unitCostINR: { type: Number, required: true, min: 0 },
    estimatedCompletionGainPercent: { type: Number, required: true, min: 0, max: 100 },
    estimatedReachPatients: { type: Number, required: true, min: 1 },
    costPerPatientINR: { type: Number, required: true, min: 0 },
    geographicSuitability: { type: [String], default: ['Rural', 'Semi-urban', 'Tribal'] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Intervention = mongoose.model<IIntervention>('Intervention', InterventionSchema);
