import mongoose, { Document, Schema, Types } from 'mongoose';

export type JourneyStageName =
  | 'Medical Need'
  | 'Hospital Search'
  | 'Travel'
  | 'Transport'
  | 'Appointment'
  | 'Hospital Visit'
  | 'Service'
  | 'Treatment'
  | 'Follow-up';

export interface IJourneyStage {
  stageName: JourneyStageName;
  order: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED';
  frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observedBarrier?: string;
  mitigationSuggestion?: string;
  completedAt?: Date;
}

export interface ICareJourney extends Document {
  patientId: Types.ObjectId;
  requestId?: Types.ObjectId;
  stages: IJourneyStage[];
  currentStageIndex: number;
  overallJourneyHealth: 'HEALTHY' | 'SLIGHT_FRICTION' | 'CRITICAL_BOTTLENECK';
  createdAt: Date;
  updatedAt: Date;
}

const JourneyStageSchema = new Schema<IJourneyStage>(
  {
    stageName: { type: String, required: true },
    order: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'AT_RISK', 'BLOCKED'],
      default: 'PENDING',
    },
    frictionLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    observedBarrier: { type: String },
    mitigationSuggestion: { type: String },
    completedAt: { type: Date },
  },
  { _id: false }
);

const CareJourneySchema = new Schema<ICareJourney>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'HospitalRequest' },
    stages: { type: [JourneyStageSchema], default: [] },
    currentStageIndex: { type: Number, default: 0 },
    overallJourneyHealth: {
      type: String,
      enum: ['HEALTHY', 'SLIGHT_FRICTION', 'CRITICAL_BOTTLENECK'],
      default: 'HEALTHY',
    },
  },
  { timestamps: true }
);

export const CareJourney = mongoose.model<ICareJourney>('CareJourney', CareJourneySchema);
