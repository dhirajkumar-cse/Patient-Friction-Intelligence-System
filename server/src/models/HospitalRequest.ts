import mongoose, { Document, Schema, Types } from 'mongoose';

export type RequestStatus =
  | 'REQUEST_CREATED'
  | 'CONSENT_GIVEN'
  | 'REQUEST_SENT'
  | 'HOSPITAL_RECEIVED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'APPOINTMENT_SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ITimelineEvent {
  status: RequestStatus;
  timestamp: Date;
  note?: string;
  actorRole: 'patient' | 'hospital' | 'admin' | 'system';
}

export interface IHospitalRequest extends Document {
  requestCode: string;
  patientId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  departmentName: string;
  reasonForVisit: string;
  preferredDate: Date;
  preferredTimeSlot: string;
  additionalMessage?: string;
  consentId: Types.ObjectId;
  documentIds: Types.ObjectId[];
  status: RequestStatus;
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
  accessibilityScoreAtRequest: number;
  topBarrierAtRequest: string;
  patientLanguage?: string;
  patientDialect?: string;
  originalMessage?: string;
  originalLanguage?: string;
  translatedMessage?: string;
  translatedLanguage?: string;
  hospitalNotes?: string;
  appointmentDateTime?: Date;
  needsAmbulance?: boolean;
  needsCareEscort?: boolean;
  ambulanceBooking?: {
    isRequested: boolean;
    status: 'REQUESTED' | 'DISPATCHED' | 'ARRIVED_AT_HOME' | 'COMPLETED' | 'CANCELLED';
    driverName?: string;
    driverPhone?: string;
    vehicleNumber?: string;
    estimatedArrivalMinutes?: number;
    pickupAddress?: string;
  };
  careEscortBooking?: {
    isRequested: boolean;
    status: 'REQUESTED' | 'ASSIGNED' | 'EN_ROUTE_TO_HOME' | 'ACCOMPANYING_PATIENT' | 'RETURN_TRIP_COMPLETED';
    escortName?: string;
    escortRole?: string;
    escortPhone?: string;
    pickupAddress?: string;
    notes?: string;
  };
  timeline: ITimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    actorRole: { type: String, enum: ['patient', 'hospital', 'admin', 'system'], default: 'patient' },
  },
  { _id: false }
);

const HospitalRequestSchema = new Schema<IHospitalRequest>(
  {
    requestCode: { type: String, unique: true, index: true, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentName: { type: String, required: true },
    reasonForVisit: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    preferredTimeSlot: { type: String, default: 'Morning (09:00 AM - 12:00 PM)' },
    additionalMessage: { type: String },
    consentId: { type: Schema.Types.ObjectId, ref: 'Consent', required: true },
    documentIds: [{ type: Schema.Types.ObjectId, ref: 'PatientDocument' }],
    status: {
      type: String,
      enum: [
        'REQUEST_CREATED',
        'CONSENT_GIVEN',
        'REQUEST_SENT',
        'HOSPITAL_RECEIVED',
        'UNDER_REVIEW',
        'ACCEPTED',
        'REJECTED',
        'APPOINTMENT_SCHEDULED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'REQUEST_SENT',
      index: true,
    },
    distanceKm: { type: Number, default: 0 },
    estimatedTravelTimeMinutes: { type: Number, default: 0 },
    accessibilityScoreAtRequest: { type: Number, default: 75 },
    topBarrierAtRequest: { type: String, default: 'Transport' },
    patientLanguage: { type: String, default: 'en' },
    patientDialect: { type: String, default: 'standard' },
    originalMessage: { type: String },
    originalLanguage: { type: String, default: 'en' },
    translatedMessage: { type: String },
    translatedLanguage: { type: String },
    hospitalNotes: { type: String },
    appointmentDateTime: { type: Date },
    needsAmbulance: { type: Boolean, default: false },
    needsCareEscort: { type: Boolean, default: false },
    ambulanceBooking: {
      isRequested: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ['REQUESTED', 'DISPATCHED', 'ARRIVED_AT_HOME', 'COMPLETED', 'CANCELLED'],
        default: 'REQUESTED',
      },
      driverName: { type: String, default: 'Gurmeet Singh' },
      driverPhone: { type: String, default: '+91 98140 12345' },
      vehicleNumber: { type: String, default: 'PB-08-AM-1082' },
      estimatedArrivalMinutes: { type: Number, default: 18 },
      pickupAddress: { type: String },
    },
    careEscortBooking: {
      isRequested: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ['REQUESTED', 'ASSIGNED', 'EN_ROUTE_TO_HOME', 'ACCOMPANYING_PATIENT', 'RETURN_TRIP_COMPLETED'],
        default: 'ASSIGNED',
      },
      escortName: { type: String, default: 'Smt. Sunita Sharma (Certified ASHA Sahayak)' },
      escortRole: { type: String, default: 'Hospital Doorstep Care Attendant' },
      escortPhone: { type: String, default: '+91 98765 88990' },
      pickupAddress: { type: String },
      notes: { type: String, default: 'Will arrive at home address, escort patient to hospital OPD, and drop back home safely.' },
    },
    timeline: { type: [TimelineEventSchema], default: [] },
  },
  { timestamps: true }
);

export const HospitalRequest = mongoose.model<IHospitalRequest>(
  'HospitalRequest',
  HospitalRequestSchema
);
