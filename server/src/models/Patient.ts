import mongoose, { Document, Schema, Types } from 'mongoose';

export type TransportLevel = 'none' | 'low' | 'moderate' | 'high';
export type DigitalAccessLevel = 'none' | 'basic' | 'moderate' | 'advanced';
export type FamilySupportLevel = 'none' | 'low' | 'moderate' | 'high';
export type DocumentationLevel = 'incomplete' | 'partial' | 'complete';
export type FinancialAccessLevel = 'severely_constrained' | 'moderate_budget' | 'adequate' | 'insured';
export type AppointmentFlexibility = 'inflexible_daily_wage' | 'rigid_hours' | 'moderate' | 'flexible';
export type ResidenceType = 'rural_remote' | 'semi_urban' | 'urban_slum' | 'urban_metro';

export interface IPatientLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  geoJSON?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface IPatient extends Document {
  userId: Types.ObjectId;
  patientCode: string; // e.g., "PAT-1048"
  age: number;
  gender: 'male' | 'female' | 'other';
  preferredLanguage: string;
  preferredDialect: string;
  simpleLanguageMode: boolean;
  voiceEnabled: boolean;
  textToSpeechEnabled: boolean;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  location: IPatientLocation;
  
  // Non-clinical accessibility determinants
  transportAvailability: TransportLevel;
  digitalAccessLevel: DigitalAccessLevel;
  familySupport: FamilySupportLevel;
  documentationStatus: DocumentationLevel;
  financialAccessibility: FinancialAccessLevel;
  appointmentFlexibility: AppointmentFlexibility;
  residenceType: ResidenceType;
  
  preferredHospitalId?: Types.ObjectId;
  activeFrictionProfileId?: Types.ObjectId;
  activeCareRiskId?: Types.ObjectId;
  currentJourneyStage: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    patientCode: { type: String, unique: true, index: true, required: true },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'female' },
    preferredLanguage: { type: String, default: 'en', index: true },
    preferredDialect: { type: String, default: 'standard' },
    simpleLanguageMode: { type: Boolean, default: false },
    voiceEnabled: { type: Boolean, default: true },
    textToSpeechEnabled: { type: Boolean, default: true },
    phone: { type: String },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    location: {
      address: { type: String, default: 'Village Ramgarh, Block B' },
      city: { type: String, default: 'Ranchi' },
      state: { type: String, default: 'Jharkhand' },
      pincode: { type: String, default: '834001' },
      latitude: { type: Number, default: 23.3441 },
      longitude: { type: Number, default: 85.3096 },
      geoJSON: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [85.3096, 23.3441] }, // [lng, lat]
      },
    },
    transportAvailability: {
      type: String,
      enum: ['none', 'low', 'moderate', 'high'],
      default: 'low',
    },
    digitalAccessLevel: {
      type: String,
      enum: ['none', 'basic', 'moderate', 'advanced'],
      default: 'basic',
    },
    familySupport: {
      type: String,
      enum: ['none', 'low', 'moderate', 'high'],
      default: 'low',
    },
    documentationStatus: {
      type: String,
      enum: ['incomplete', 'partial', 'complete'],
      default: 'partial',
    },
    financialAccessibility: {
      type: String,
      enum: ['severely_constrained', 'moderate_budget', 'adequate', 'insured'],
      default: 'severely_constrained',
    },
    appointmentFlexibility: {
      type: String,
      enum: ['inflexible_daily_wage', 'rigid_hours', 'moderate', 'flexible'],
      default: 'inflexible_daily_wage',
    },
    residenceType: {
      type: String,
      enum: ['rural_remote', 'semi_urban', 'urban_slum', 'urban_metro'],
      default: 'rural_remote',
    },
    preferredHospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    activeFrictionProfileId: { type: Schema.Types.ObjectId, ref: 'FrictionProfile' },
    activeCareRiskId: { type: Schema.Types.ObjectId, ref: 'CareRisk' },
    currentJourneyStage: {
      type: String,
      default: 'Medical Need',
    },
  },
  { timestamps: true }
);

PatientSchema.index({ 'location.geoJSON': '2dsphere' });

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
