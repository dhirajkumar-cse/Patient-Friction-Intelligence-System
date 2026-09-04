import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IHospital extends Document {
  userId: Types.ObjectId;
  name: string;
  type: 'Government' | 'Private' | 'Charitable' | 'Autonomous';
  tagline?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  geoJSON: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  phone: string;
  emergencyPhone?: string;
  email: string;
  website?: string;
  workingHours: string;
  emergencyAvailable: boolean;
  totalBeds: number;
  availableBeds: number;
  specialistAvailable: boolean;
  diagnosticFacilities: string[];
  languagesSupported: string[];
  averageWaitTimeMinutes: number;
  rating: number;
  isVerified: boolean;
  imageUrl?: string;
  ambulanceService?: {
    totalAmbulances: number;
    availableAmbulances: number;
    emergencyContact: string;
    avgEtaMins: number;
    isAvailable: boolean;
  };
  careAttendantService?: {
    availableEscorts: number;
    escortTypeName: string; // e.g. "Hospital Swasthya Sahayak / ASHA Escort"
    homePickupDropAvailable: boolean;
    contactNumber: string;
    isAvailable: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: ['Government', 'Private', 'Charitable', 'Autonomous'],
      default: 'Government',
      index: true,
    },
    tagline: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    geoJSON: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    phone: { type: String, required: true },
    emergencyPhone: { type: String },
    email: { type: String, required: true },
    website: { type: String },
    workingHours: { type: String, default: '24/7 Emergency | OPD: 08:00 AM - 04:00 PM' },
    emergencyAvailable: { type: Boolean, default: true, index: true },
    totalBeds: { type: Number, default: 250 },
    availableBeds: { type: Number, default: 42 },
    specialistAvailable: { type: Boolean, default: true },
    diagnosticFacilities: {
      type: [String],
      default: ['Pathology Lab', 'Digital X-Ray', 'Ultrasound', 'ECG', 'CT Scan'],
    },
    languagesSupported: {
      type: [String],
      default: ['English', 'Hindi', 'Bengali', 'Santali'],
    },
    averageWaitTimeMinutes: { type: Number, default: 35 },
    rating: { type: Number, default: 4.3, min: 1, max: 5 },
    isVerified: { type: Boolean, default: true },
    imageUrl: { type: String },
    ambulanceService: {
      totalAmbulances: { type: Number, default: 4 },
      availableAmbulances: { type: Number, default: 2 },
      emergencyContact: { type: String, default: '108' },
      avgEtaMins: { type: Number, default: 18 },
      isAvailable: { type: Boolean, default: true },
    },
    careAttendantService: {
      availableEscorts: { type: Number, default: 3 },
      escortTypeName: { type: String, default: 'Hospital Swasthya Sahayak / ASHA Escort' },
      homePickupDropAvailable: { type: Boolean, default: true },
      contactNumber: { type: String, default: '+91 98765 43210' },
      isAvailable: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

HospitalSchema.index({ geoJSON: '2dsphere' });

export const Hospital = mongoose.model<IHospital>('Hospital', HospitalSchema);
