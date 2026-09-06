import { getDB } from '../db.js';
import crypto from 'crypto';

export interface PublicHealthTriageEntity {
  id: string;
  patient_id?: string;
  chief_complaint: string;
  acuity_level: 'Emergency' | 'Urgent' | 'Routine' | 'Preventive';
  recommended_tier: string;
  recommended_hospital_id?: string;
  recommended_hospital_name?: string;
  symptoms_json: string;
  vitals_json: string;
  operational_barriers_json: string;
  triage_notes: string;
  created_at?: string;
}

export interface ReferralEntity {
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
  created_at?: string;
  updated_at?: string;
}

export interface HealthRecordEntity {
  id: string;
  patient_id: string;
  abha_id: string;
  facility_id?: string;
  facility_name: string;
  doctor_name: string;
  record_type: string;
  record_date: string;
  diagnosis: string;
  vitals_json?: string;
  prescription_json?: string;
  notes?: string;
  fhir_bundle_json?: string;
  created_at?: string;
}

export interface DiagnosticEntity {
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
  created_at?: string;
}

export interface DiagnosticBookingEntity {
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
  created_at?: string;
}

export interface EssentialMedicineEntity {
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
  updated_at?: string;
}

export interface HighRiskRegistryEntity {
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
  assigned_facility_id?: string;
  follow_up_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FrontlineTaskEntity {
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
  created_at?: string;
}

export interface EmergencyDispatchEntity {
  id: string;
  dispatch_number: string;
  patient_name: string;
  phone: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  emergency_type: string;
  assigned_ambulance_vehicle: string;
  eta_minutes: number;
  destination_hospital_id?: string;
  destination_hospital_name: string;
  status: string;
  created_at?: string;
}

export class PublicHealthRepository {
  // 1. Triage
  static async createTriage(data: Omit<PublicHealthTriageEntity, 'id'> & { id?: string }): Promise<PublicHealthTriageEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO public_health_triage (id, patient_id, chief_complaint, acuity_level, recommended_tier, recommended_hospital_id, symptoms_json, vitals_json, operational_barriers_json, triage_notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        data.patient_id || null,
        data.chief_complaint,
        data.acuity_level,
        data.recommended_tier,
        data.recommended_hospital_id || null,
        data.symptoms_json,
        data.vitals_json,
        data.operational_barriers_json,
        data.triage_notes,
        now,
      ]
    );
    return { ...data, id, created_at: now };
  }

  static async findTriageByPatient(patientId: string): Promise<PublicHealthTriageEntity[]> {
    const db = getDB();
    const res = await db.query<PublicHealthTriageEntity>(
      'SELECT * FROM public_health_triage WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    return res.rows;
  }

  // 2. Referrals
  static async createReferral(data: Omit<ReferralEntity, 'id' | 'referral_code'> & { id?: string; referral_code?: string }): Promise<ReferralEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const referral_code = data.referral_code || `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO referrals (id, referral_code, patient_id, patient_name, from_facility_id, from_facility_name, from_tier, to_facility_id, to_facility_name, to_tier, specialty_required, reason_for_referral, priority, transport_mode, status, counter_referral_notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        id,
        referral_code,
        data.patient_id,
        data.patient_name,
        data.from_facility_id,
        data.from_facility_name,
        data.from_tier,
        data.to_facility_id,
        data.to_facility_name,
        data.to_tier,
        data.specialty_required,
        data.reason_for_referral,
        data.priority || 'Routine',
        data.transport_mode || 'Public Bus',
        data.status || 'Initiated',
        data.counter_referral_notes || null,
        now,
        now,
      ]
    );
    return { ...data, id, referral_code, created_at: now, updated_at: now };
  }

  static async getReferrals(filter?: { patient_id?: string; facility_id?: string }): Promise<ReferralEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM referrals';
    const params: any[] = [];
    if (filter?.patient_id) {
      sql += ' WHERE patient_id = $1';
      params.push(filter.patient_id);
    } else if (filter?.facility_id) {
      sql += ' WHERE to_facility_id = $1 OR from_facility_id = $1';
      params.push(filter.facility_id);
    }
    sql += ' ORDER BY created_at DESC';
    const res = await db.query<ReferralEntity>(sql, params);
    return res.rows;
  }

  static async updateReferralStatus(id: string, status: string, notes?: string): Promise<ReferralEntity | null> {
    const db = getDB();
    const now = new Date().toISOString();
    await db.query(
      'UPDATE referrals SET status = $1, counter_referral_notes = COALESCE($2, counter_referral_notes), updated_at = $3 WHERE id = $4',
      [status, notes || null, now, id]
    );
    const res = await db.query<ReferralEntity>('SELECT * FROM referrals WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  // 3. Health Records (Longitudinal & ABHA)
  static async getHealthRecords(patientId: string): Promise<HealthRecordEntity[]> {
    const db = getDB();
    const res = await db.query<HealthRecordEntity>(
      'SELECT * FROM health_records WHERE patient_id = $1 ORDER BY record_date DESC',
      [patientId]
    );
    return res.rows;
  }

  static async createHealthRecord(data: Omit<HealthRecordEntity, 'id'> & { id?: string }): Promise<HealthRecordEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO health_records (id, patient_id, abha_id, facility_id, facility_name, doctor_name, record_type, record_date, diagnosis, vitals_json, prescription_json, notes, fhir_bundle_json, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id,
        data.patient_id,
        data.abha_id,
        data.facility_id || null,
        data.facility_name,
        data.doctor_name,
        data.record_type,
        data.record_date,
        data.diagnosis,
        data.vitals_json || null,
        data.prescription_json || null,
        data.notes || null,
        data.fhir_bundle_json || null,
        now,
      ]
    );
    return { ...data, id, created_at: now };
  }

  // 4. Diagnostics & Equipment
  static async getDiagnostics(facilityId?: string): Promise<DiagnosticEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM diagnostics';
    const params: any[] = [];
    if (facilityId) {
      sql += ' WHERE facility_id = $1';
      params.push(facilityId);
    }
    sql += ' ORDER BY category ASC, test_name ASC';
    const res = await db.query<DiagnosticEntity>(sql, params);
    return res.rows;
  }

  static async createDiagnosticBooking(data: Omit<DiagnosticBookingEntity, 'id' | 'booking_number'> & { id?: string; booking_number?: string }): Promise<DiagnosticBookingEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const booking_number = data.booking_number || `DXB-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO diagnostic_bookings (id, booking_number, diagnostic_id, patient_id, patient_name, facility_name, test_name, scheduled_date, sample_status, report_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        booking_number,
        data.diagnostic_id,
        data.patient_id,
        data.patient_name,
        data.facility_name,
        data.test_name,
        data.scheduled_date,
        data.sample_status || 'Slot Confirmed',
        data.report_url || null,
        now,
      ]
    );
    return { ...data, id, booking_number, created_at: now };
  }

  static async getDiagnosticBookings(patientId?: string): Promise<DiagnosticBookingEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM diagnostic_bookings';
    const params: any[] = [];
    if (patientId) {
      sql += ' WHERE patient_id = $1';
      params.push(patientId);
    }
    sql += ' ORDER BY created_at DESC';
    const res = await db.query<DiagnosticBookingEntity>(sql, params);
    return res.rows;
  }

  // 5. Essential Medicines (e-Aushadhi)
  static async getMedicines(filter?: { facilityId?: string; search?: string; category?: string; status?: string }): Promise<EssentialMedicineEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM essential_medicines';
    const params: any[] = [];
    if (filter?.facilityId) {
      sql += ' WHERE facility_id = $1';
      params.push(filter.facilityId);
    }
    sql += ' ORDER BY medicine_name ASC';
    const res = await db.query<EssentialMedicineEntity>(sql, params);
    let list = res.rows;
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(m => m.medicine_name.toLowerCase().includes(q) || m.generic_name.toLowerCase().includes(q));
    }
    if (filter?.category && filter.category !== 'All') {
      list = list.filter(m => m.category === filter.category);
    }
    if (filter?.status && filter.status !== 'All') {
      list = list.filter(m => m.status === filter.status);
    }
    return list;
  }

  // 6. High-Risk Registry
  static async getHighRiskRegistry(filter?: { patient_id?: string; cohort?: string }): Promise<HighRiskRegistryEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM high_risk_registry';
    const params: any[] = [];
    if (filter?.patient_id) {
      sql += ' WHERE patient_id = $1';
      params.push(filter.patient_id);
    }
    sql += ' ORDER BY next_due_date ASC';
    const res = await db.query<HighRiskRegistryEntity>(sql, params);
    let rows = res.rows;
    if (filter?.cohort && filter.cohort !== 'All') {
      rows = rows.filter(r => r.cohort_type.toLowerCase().includes(filter.cohort!.toLowerCase()));
    }
    return rows;
  }

  static async createHighRiskEntry(data: Omit<HighRiskRegistryEntity, 'id'> & { id?: string }): Promise<HighRiskRegistryEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO high_risk_registry (id, patient_id, patient_name, cohort_type, risk_level, primary_condition, current_milestone, next_due_date, status, assigned_asha_name, assigned_facility_id, follow_up_notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id,
        data.patient_id,
        data.patient_name,
        data.cohort_type,
        data.risk_level || 'Moderate',
        data.primary_condition,
        data.current_milestone,
        data.next_due_date,
        data.status || 'Active',
        data.assigned_asha_name || 'ASHA Tai (Sunanda Kadam)',
        data.assigned_facility_id || null,
        data.follow_up_notes || null,
        now,
        now,
      ]
    );
    return { ...data, id, created_at: now, updated_at: now };
  }

  static async updateHighRiskStatus(id: string, status: string, notes?: string): Promise<HighRiskRegistryEntity | null> {
    const db = getDB();
    const now = new Date().toISOString();
    await db.query(
      'UPDATE high_risk_registry SET status = $1, follow_up_notes = COALESCE($2, follow_up_notes), updated_at = $3 WHERE id = $4',
      [status, notes || null, now, id]
    );
    const res = await db.query<HighRiskRegistryEntity>('SELECT * FROM high_risk_registry WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  // 7. Frontline Tasks (ASHA / ANM / CHO)
  static async getFrontlineTasks(workerId?: string): Promise<FrontlineTaskEntity[]> {
    const db = getDB();
    const sql = 'SELECT * FROM frontline_tasks ORDER BY due_date ASC';
    const res = await db.query<FrontlineTaskEntity>(sql);
    if (workerId) {
      return res.rows.filter(t => t.worker_id === workerId);
    }
    return res.rows;
  }

  static async createFrontlineTask(data: Omit<FrontlineTaskEntity, 'id'> & { id?: string }): Promise<FrontlineTaskEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO frontline_tasks (id, worker_id, worker_name, worker_role, village_name, beneficiary_name, beneficiary_phone, task_type, due_date, status, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        data.worker_id,
        data.worker_name,
        data.worker_role || 'ASHA',
        data.village_name,
        data.beneficiary_name,
        data.beneficiary_phone || null,
        data.task_type,
        data.due_date,
        data.status || 'Pending',
        data.notes || null,
        now,
      ]
    );
    return { ...data, id, created_at: now };
  }

  static async updateFrontlineTaskStatus(id: string, status: string, notes?: string): Promise<FrontlineTaskEntity | null> {
    const db = getDB();
    await db.query(
      'UPDATE frontline_tasks SET status = $1, notes = COALESCE($2, notes) WHERE id = $3',
      [status, notes || null, id]
    );
    const res = await db.query<FrontlineTaskEntity>('SELECT * FROM frontline_tasks WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  // 8. Emergency 108 SOS Dispatches
  static async createEmergencyDispatch(data: Omit<EmergencyDispatchEntity, 'id' | 'dispatch_number'> & { id?: string; dispatch_number?: string }): Promise<EmergencyDispatchEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const dispatch_number = data.dispatch_number || `SOS-108-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO emergency_dispatches (id, dispatch_number, patient_name, phone, location_name, latitude, longitude, emergency_type, assigned_ambulance_vehicle, eta_minutes, destination_hospital_id, destination_hospital_name, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id,
        dispatch_number,
        data.patient_name,
        data.phone,
        data.location_name,
        data.latitude || null,
        data.longitude || null,
        data.emergency_type,
        data.assigned_ambulance_vehicle || 'MH-11-AX-1081 (Advanced Life Support)',
        data.eta_minutes || 11,
        data.destination_hospital_id || null,
        data.destination_hospital_name,
        data.status || 'Dispatched',
        now,
      ]
    );
    return { ...data, id, dispatch_number, created_at: now };
  }

  static async getEmergencyDispatches(): Promise<EmergencyDispatchEntity[]> {
    const db = getDB();
    const res = await db.query<EmergencyDispatchEntity>('SELECT * FROM emergency_dispatches ORDER BY created_at DESC');
    return res.rows;
  }
}
