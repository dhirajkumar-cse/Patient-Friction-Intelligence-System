import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IHospitalDepartment extends Document {
  hospitalId: Types.ObjectId;
  name: string; // e.g. "Cardiology", "Orthopedics", "General Medicine", "Pediatrics", "Obstetrics & Gynecology"
  description?: string;
  headDoctorName?: string;
  opdDays: string[]; // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  opdTimings: string; // e.g. "09:00 AM - 02:00 PM"
  dailyTokenCapacity: number;
  availableTokensToday: number;
  consultationFee: number; // in INR
  isAcceptingRequests: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalDepartmentSchema = new Schema<IHospitalDepartment>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    headDoctorName: { type: String },
    opdDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    opdTimings: { type: String, default: '09:00 AM - 02:00 PM' },
    dailyTokenCapacity: { type: Number, default: 50 },
    availableTokensToday: { type: Number, default: 28 },
    consultationFee: { type: Number, default: 0 },
    isAcceptingRequests: { type: Boolean, default: true },
  },
  { timestamps: true }
);

HospitalDepartmentSchema.index({ hospitalId: 1, name: 1 }, { unique: true });

export const HospitalDepartment = mongoose.model<IHospitalDepartment>(
  'HospitalDepartment',
  HospitalDepartmentSchema
);
