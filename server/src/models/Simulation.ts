import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISimulation extends Document {
  title: string;
  scenarioName: string;
  baselineCompletionProbability: number;
  simulatedCompletionProbability: number;
  improvementDeltaPercent: number;
  selectedInterventionCodes: string[];
  totalBudgetRequiredINR: number;
  estimatedPatientsHelped: number;
  regionTargeted: string;
  runByUserId?: Types.ObjectId;
  notes?: string;
  disclaimer: string;
  createdAt: Date;
  updatedAt: Date;
}

const SimulationSchema = new Schema<ISimulation>(
  {
    title: { type: String, required: true },
    scenarioName: { type: String, required: true },
    baselineCompletionProbability: { type: Number, required: true },
    simulatedCompletionProbability: { type: Number, required: true },
    improvementDeltaPercent: { type: Number, required: true },
    selectedInterventionCodes: { type: [String], required: true },
    totalBudgetRequiredINR: { type: Number, required: true },
    estimatedPatientsHelped: { type: Number, required: true },
    regionTargeted: { type: String, default: 'All High Friction Districts' },
    runByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    disclaimer: {
      type: String,
      default: 'Simulated estimate based on operational barrier reduction models. Non-clinical forecast.',
    },
  },
  { timestamps: true }
);

export const Simulation = mongoose.model<ISimulation>('Simulation', SimulationSchema);
