import { api } from './api';

export interface TriageResult {
  triage: {
    id: string;
    chief_complaint: string;
    acuity_level: 'Emergency' | 'Urgent' | 'Routine' | 'Preventive';
    recommended_tier: string;
    recommended_hospital_id?: string;
    symptoms_json: string;
    vitals_json: string;
    operational_barriers_json: string;
    triage_notes: string;
    created_at: string;
  };
  recommendedFacility: any;
  acuityLevel: 'Emergency' | 'Urgent' | 'Routine' | 'Preventive';
  recommendedTier: string;
  triageNotes: string;
  operationalBarriers: string[];
  actionableSteps: string[];
}

export interface Referral {
  id: string;
  referral_code: string;
  patient_id: string;
  patient_name: string;
  from_facility_id: string;
  from_facility_name: string;
  from_tier: string;
  to_facility_id: string;
  to_facility_name: string;
  to_tier: string;
  specialty_required: string;
  reason_for_referral: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  transport_mode: string;
  status: 'Initiated' | 'In Transit' | 'Arrived' | 'Specialist Consulted' | 'Completed' | 'Counter-Referred';
  counter_referral_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  patient_id: string;
  abha_id: string;
  facility_id?: string;
  facility_name: string;
  doctor_name: string;
  record_type: string;
  record_date: string;
  diagnosis: string;
  vitals?: Record<string, any>;
  vitals_json?: string;
  prescription?: any[];
  prescription_json?: string;
  notes?: string;
  fhir_bundle_json?: string;
  created_at?: string;
}

export interface DiagnosticTest {
  id: string;
  facility_id: string;
  facility_name: string;
  facility_tier: string;
  test_name: string;
  category: string;
  is_equipment_functional: boolean;
  operational_hours: string;
  technician_available: boolean;
  fee: number;
  tat_hours: number;
}

export interface DiagnosticBooking {
  id: string;
  booking_number: string;
  diagnostic_id: string;
  patient_id: string;
  patient_name: string;
  facility_name: string;
  test_name: string;
  scheduled_date: string;
  sample_status: string;
  report_url?: string;
  created_at: string;
}

export interface EssentialMedicine {
  id: string;
  facility_id: string;
  facility_name: string;
  facility_tier: string;
  medicine_name: string;
  generic_name: string;
  category: string;
  dosage_form: string;
  stock_count: number;
  min_threshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  batch_number: string;
  expiry_date: string;
}

export interface HighRiskPatient {
  id: string;
  patient_id: string;
  patient_name: string;
  cohort_type: string;
  risk_level: string;
  primary_condition: string;
  current_milestone: string;
  next_due_date: string;
  status: string;
  assigned_asha_name?: string;
  follow_up_notes?: string;
}

export interface FrontlineTask {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_role: string;
  village_name: string;
  beneficiary_name: string;
  beneficiary_phone?: string;
  task_type: string;
  due_date: string;
  status: string;
  notes?: string;
}

export const publicHealthService = {
  // 1. Digital Triage
  async runTriage(data: {
    chiefComplaint: string;
    symptoms?: string[];
    vitals?: Record<string, any>;
    mobilityStatus?: string;
    distanceKm?: number;
    hasCaregiver?: boolean;
  }): Promise<TriageResult> {
    const res = await api.post('/public-health/triage', data);
    return res.data.data;
  },

  async getPatientTriageHistory(): Promise<any[]> {
    const res = await api.get('/public-health/triage/patient');
    return res.data.data || [];
  },

  // 2. Referrals
  async getReferrals(params?: { patientId?: string; facilityId?: string }): Promise<Referral[]> {
    const res = await api.get('/public-health/referrals', { params });
    return res.data.data || [];
  },

  async createReferral(data: Partial<Referral>): Promise<Referral> {
    const res = await api.post('/public-health/referrals', data);
    return res.data.data;
  },

  async updateReferralStatus(id: string, status: string, counterReferralNotes?: string): Promise<Referral> {
    const res = await api.patch(`/public-health/referrals/${id}/status`, { status, counterReferralNotes });
    return res.data.data;
  },

  // 3. Health Records & ABHA
  async getHealthRecords(patientId?: string): Promise<{ abhaId: string; records: HealthRecord[] }> {
    const res = await api.get(`/public-health/records${patientId ? `/${patientId}` : ''}`);
    return res.data.data || { abhaId: '91-4582-7391-2041@abdm', records: [] };
  },

  async createHealthRecord(data: Partial<HealthRecord>): Promise<HealthRecord> {
    const res = await api.post('/public-health/records', data);
    return res.data.data;
  },

  // 4. Diagnostics
  async getDiagnostics(facilityId?: string): Promise<DiagnosticTest[]> {
    const res = await api.get('/public-health/diagnostics', { params: { facilityId } });
    return res.data.data || [];
  },

  async bookDiagnostic(data: { diagnosticId: string; testName: string; facilityName: string; scheduledDate: string; patientName?: string }): Promise<DiagnosticBooking> {
    const res = await api.post('/public-health/diagnostics/book', data);
    return res.data.data;
  },

  async getDiagnosticBookings(): Promise<DiagnosticBooking[]> {
    const res = await api.get('/public-health/diagnostics/bookings');
    return res.data.data || [];
  },

  // 5. Medicines
  async getMedicines(params?: { facilityId?: string; search?: string; category?: string; status?: string }): Promise<EssentialMedicine[]> {
    const res = await api.get('/public-health/medicines', { params });
    return res.data.data || [];
  },

  // 6. High-Risk Registry
  async getHighRiskRegistry(cohort?: string): Promise<HighRiskPatient[]> {
    const res = await api.get('/public-health/high-risk', { params: { cohort } });
    return res.data.data || [];
  },

  async createHighRiskEntry(data: Partial<HighRiskPatient>): Promise<HighRiskPatient> {
    const res = await api.post('/public-health/high-risk', data);
    return res.data.data;
  },

  async updateHighRiskStatus(id: string, status: string, followUpNotes?: string): Promise<HighRiskPatient> {
    const res = await api.patch(`/public-health/high-risk/${id}/status`, { status, followUpNotes });
    return res.data.data;
  },

  // 7. Frontline Tasks
  async getFrontlineTasks(workerId?: string): Promise<FrontlineTask[]> {
    const res = await api.get('/public-health/frontline/tasks', { params: { workerId } });
    return res.data.data || [];
  },

  async createFrontlineTask(data: Partial<FrontlineTask>): Promise<FrontlineTask> {
    const res = await api.post('/public-health/frontline/tasks', data);
    return res.data.data;
  },

  async updateFrontlineTaskStatus(id: string, status: string, notes?: string): Promise<FrontlineTask> {
    const res = await api.patch(`/public-health/frontline/tasks/${id}/status`, { status, notes });
    return res.data.data;
  },

  // 8. Emergency 108 SOS
  async triggerEmergencySOS(data?: { patientName?: string; phone?: string; locationName?: string; emergencyType?: string }): Promise<any> {
    const res = await api.post('/public-health/emergency/sos', data || {});
    return res.data.data;
  },

  // 9. Facility Quality & NQAS Metrics
  async getFacilityMetrics(facilityId: string): Promise<any> {
    const res = await api.get(`/public-health/facilities/${facilityId}/metrics`);
    return res.data.data;
  },
};
