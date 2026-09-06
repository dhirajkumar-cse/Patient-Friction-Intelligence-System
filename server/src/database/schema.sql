-- ==========================================================
-- PATIENT FRICTION INTELLIGENCE SYSTEM (PFIS) - DATABASE SCHEMA
-- Compatible with PostgreSQL & MySQL (ANSI SQL Standard)
-- 13 Relational Tables with Foreign Keys and Indexes
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'patient', -- 'patient', 'hospital', 'admin'
    phone VARCHAR(64),
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. PATIENT PROFILES (Non-Clinical Operational & Accessibility Parameters)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    age INT DEFAULT 45,
    gender VARCHAR(32) DEFAULT 'Other',
    location VARCHAR(255) DEFAULT 'Rural',
    is_rural BOOLEAN DEFAULT TRUE,
    distance_to_hospital_km DECIMAL(6,2) DEFAULT 25.0,
    transport_mode VARCHAR(64) DEFAULT 'Bus',
    digital_literacy VARCHAR(64) DEFAULT 'Low',
    family_support VARCHAR(64) DEFAULT 'Moderate',
    wage_loss_risk VARCHAR(64) DEFAULT 'High',
    preferred_language VARCHAR(32) DEFAULT 'en',
    smartphone_access BOOLEAN DEFAULT TRUE,
    internet_type VARCHAR(64) DEFAULT 'Mobile 4G',
    disability_needs TEXT,
    appointment_flexibility VARCHAR(64) DEFAULT 'Morning Only',
    document_readiness VARCHAR(64) DEFAULT 'Partial',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON patient_profiles(user_id);

-- 3. HOSPITALS (Healthcare Access Facilities)
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) DEFAULT 'General',
    city VARCHAR(128) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    phone VARCHAR(64),
    total_beds INT DEFAULT 100,
    available_beds INT DEFAULT 25,
    emergency_24x7 BOOLEAN DEFAULT TRUE,
    teleconsult_available BOOLEAN DEFAULT TRUE,
    accessibility_facilities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);

-- 4. HOSPITAL SERVICES (Departments, Token Capacities & Non-Clinical Services)
CREATE TABLE IF NOT EXISTS hospital_services (
    id VARCHAR(64) PRIMARY KEY,
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(128) NOT NULL,
    total_daily_tokens INT DEFAULT 50,
    available_tokens INT DEFAULT 20,
    fee DECIMAL(8,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_hospital ON hospital_services(hospital_id);

-- 5. APPOINTMENTS (Non-Clinical Scheduling & Token Allocations)
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    service_id VARCHAR(64) REFERENCES hospital_services(id) ON DELETE SET NULL,
    scheduled_date VARCHAR(64) NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    token_number INT,
    status VARCHAR(32) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Completed', 'Cancelled'
    friction_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital ON appointments(hospital_id);

-- 6. TELECONSULTATIONS (Live Remote Navigation Sessions)
CREATE TABLE IF NOT EXISTS teleconsultations (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(128) NOT NULL,
    scheduled_time VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'Scheduled', -- 'Scheduled', 'In-Progress', 'Completed', 'Cancelled'
    room_id VARCHAR(128) NOT NULL,
    channel_type VARCHAR(32) DEFAULT 'Video', -- 'Video', 'Audio'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teleconsult_patient ON teleconsultations(patient_id);

-- 7. FRICTION PROFILES (Explainable Non-Clinical Barrier Scores)
CREATE TABLE IF NOT EXISTS friction_profiles (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Low Friction', 'Moderate Friction', 'High Friction', 'Critical Access Difficulty'
    journey_completion_prob DECIMAL(5,2) NOT NULL,
    primary_barrier VARCHAR(128) NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_friction_patient ON friction_profiles(patient_id);

-- 8. FRICTION FACTORS (Decomposed Operational Attributes)
CREATE TABLE IF NOT EXISTS friction_factors (
    id VARCHAR(64) PRIMARY KEY,
    friction_profile_id VARCHAR(64) NOT NULL REFERENCES friction_profiles(id) ON DELETE CASCADE,
    factor_name VARCHAR(128) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    explanation TEXT NOT NULL,
    suggested_intervention TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_factors_profile ON friction_factors(friction_profile_id);

-- 9. ACCESSIBILITY RISKS (Mitigation Strategies)
CREATE TABLE IF NOT EXISTS accessibility_risks (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    risk_level VARCHAR(32) NOT NULL,
    barrier_title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    mitigation_action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risks_patient ON accessibility_risks(patient_id);

-- 10. REQUESTS (Support, Transit, Appointment & Escort Inquiries)
CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE SET NULL,
    request_type VARCHAR(64) NOT NULL, -- 'Appointment', 'Teleconsultation', 'Accessibility Support', 'Transport Support', 'Document Assistance'
    status VARCHAR(32) DEFAULT 'Pending', -- 'Pending', 'Processing', 'Approved', 'Completed', 'Cancelled'
    details TEXT,
    priority VARCHAR(32) DEFAULT 'Standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_patient ON requests(patient_id);

-- 11. DOCUMENTS (Vault for Identification & Non-Clinical Records)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL, -- 'ID Proof', 'Medical Document', 'Appointment Document', 'Insurance', 'Other'
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_kb DECIMAL(8,2) DEFAULT 120.0,
    mime_type VARCHAR(64) DEFAULT 'application/pdf',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patient_id);

-- 12. NOTIFICATIONS (Live Operational Status Alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- 13. AUDIT LOGS (Compliance & Access Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    ip_address VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);

-- 14. PUBLIC HEALTH TRIAGE (Operational & Clinical Tier Routing)
CREATE TABLE IF NOT EXISTS public_health_triage (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    chief_complaint TEXT NOT NULL,
    acuity_level VARCHAR(32) NOT NULL, -- 'Emergency', 'Urgent', 'Routine', 'Preventive'
    recommended_tier VARCHAR(64) NOT NULL, -- 'Sub-Centre / AAM', 'Primary Health Centre (PHC)', 'Rural Hospital (RH) / CHC', 'District Hospital / Medical College', '108 Emergency'
    recommended_hospital_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE SET NULL,
    symptoms_json TEXT,
    vitals_json TEXT,
    operational_barriers_json TEXT,
    triage_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. REFERRALS (Multi-Tier Public Health Continuity)
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(64) PRIMARY KEY,
    referral_code VARCHAR(64) UNIQUE NOT NULL,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    from_facility_id VARCHAR(64) NOT NULL REFERENCES hospitals(id),
    from_facility_name VARCHAR(255) NOT NULL,
    from_tier VARCHAR(64) NOT NULL,
    to_facility_id VARCHAR(64) NOT NULL REFERENCES hospitals(id),
    to_facility_name VARCHAR(255) NOT NULL,
    to_tier VARCHAR(64) NOT NULL,
    specialty_required VARCHAR(128) NOT NULL,
    reason_for_referral TEXT NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'Routine', -- 'Routine', 'Urgent', 'Emergency'
    transport_mode VARCHAR(64) DEFAULT 'Public Bus', -- '108 Emergency Ambulance', '102 Janani Shishu Express', 'Public Bus', 'Private Vehicle'
    status VARCHAR(32) NOT NULL DEFAULT 'Initiated', -- 'Initiated', 'In Transit', 'Arrived', 'Specialist Consulted', 'Completed', 'Counter-Referred'
    counter_referral_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. HEALTH RECORDS (Longitudinal Interoperable Care & ABHA)
CREATE TABLE IF NOT EXISTS health_records (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    abha_id VARCHAR(64) NOT NULL,
    facility_id VARCHAR(64) REFERENCES hospitals(id),
    facility_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    record_type VARCHAR(64) NOT NULL, -- 'OPD Consultation', 'Diagnostic Report', 'Prescription', 'Immunization', 'Discharge Summary', 'Referral Note'
    record_date VARCHAR(64) NOT NULL,
    diagnosis TEXT NOT NULL,
    vitals_json TEXT,
    prescription_json TEXT,
    notes TEXT,
    fhir_bundle_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. DIAGNOSTICS & EQUIPMENT UPTIME
CREATE TABLE IF NOT EXISTS diagnostics (
    id VARCHAR(64) PRIMARY KEY,
    facility_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    facility_name VARCHAR(255) NOT NULL,
    facility_tier VARCHAR(64) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Pathology', 'Radiology', 'Cardiology', 'Microbiology'
    is_equipment_functional BOOLEAN DEFAULT TRUE,
    operational_hours VARCHAR(128) DEFAULT '08:00 AM - 02:00 PM',
    technician_available BOOLEAN DEFAULT TRUE,
    fee DECIMAL(8,2) DEFAULT 0.00,
    tat_hours INT DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. DIAGNOSTIC BOOKINGS
CREATE TABLE IF NOT EXISTS diagnostic_bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_number VARCHAR(64) UNIQUE NOT NULL,
    diagnostic_id VARCHAR(64) NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    scheduled_date VARCHAR(64) NOT NULL,
    sample_status VARCHAR(64) DEFAULT 'Slot Confirmed', -- 'Slot Confirmed', 'Sample Collected', 'Processing', 'Report Ready'
    report_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. ESSENTIAL MEDICINES (e-Aushadhi Real-Time Inventory)
CREATE TABLE IF NOT EXISTS essential_medicines (
    id VARCHAR(64) PRIMARY KEY,
    facility_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    facility_name VARCHAR(255) NOT NULL,
    facility_tier VARCHAR(64) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL, -- 'Antibiotic', 'Analgesic', 'Anti-Hypertensive', 'Anti-Diabetic', 'Maternal Health', 'Emergency / Antidote', 'Vaccine'
    dosage_form VARCHAR(64) NOT NULL, -- 'Tablet', 'Syrup', 'Injection', 'Capsule', 'Sachet'
    stock_count INT NOT NULL DEFAULT 100,
    min_threshold INT NOT NULL DEFAULT 20,
    status VARCHAR(32) NOT NULL DEFAULT 'In Stock', -- 'In Stock', 'Low Stock', 'Out of Stock'
    batch_number VARCHAR(64),
    expiry_date VARCHAR(64),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. HIGH-RISK REGISTRY (Maternal, Child & Chronic NCDs)
CREATE TABLE IF NOT EXISTS high_risk_registry (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    cohort_type VARCHAR(64) NOT NULL, -- 'Maternal (HRP)', 'Child (Immunization)', 'Chronic NCD (Hypertension)', 'Chronic NCD (Diabetes)', 'Tuberculosis (DOTS)'
    risk_level VARCHAR(32) NOT NULL DEFAULT 'Moderate', -- 'High Risk', 'Moderate Risk', 'Critical'
    primary_condition VARCHAR(255) NOT NULL,
    current_milestone VARCHAR(255) NOT NULL,
    next_due_date VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active', -- 'Active', 'Overdue', 'Completed', 'Escalated'
    assigned_asha_name VARCHAR(255),
    assigned_facility_id VARCHAR(64) REFERENCES hospitals(id),
    follow_up_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. FRONTLINE TASKS & BENEFICIARIES (ASHA / ANM / CHO)
CREATE TABLE IF NOT EXISTS frontline_tasks (
    id VARCHAR(64) PRIMARY KEY,
    worker_id VARCHAR(64) NOT NULL,
    worker_name VARCHAR(255) NOT NULL,
    worker_role VARCHAR(64) NOT NULL DEFAULT 'ASHA', -- 'ASHA', 'ANM', 'CHO'
    village_name VARCHAR(255) NOT NULL,
    beneficiary_name VARCHAR(255) NOT NULL,
    beneficiary_phone VARCHAR(64),
    task_type VARCHAR(64) NOT NULL, -- 'Doorstep Triage', 'ANC Home Visit', 'Child Immunization Due', 'TB Medicine Dispense', 'Assisted Teleconsult'
    due_date VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Completed', 'Rescheduled'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. EMERGENCY DISPATCHES (108 SOS)
CREATE TABLE IF NOT EXISTS emergency_dispatches (
    id VARCHAR(64) PRIMARY KEY,
    dispatch_number VARCHAR(64) UNIQUE NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    emergency_type VARCHAR(128) NOT NULL, -- 'Road Accident / Trauma', 'Cardiac / Chest Pain', 'Maternal / Labor', 'Snake Bite / Poisoning', 'Pediatric Emergency'
    assigned_ambulance_vehicle VARCHAR(64) NOT NULL,
    eta_minutes INT NOT NULL DEFAULT 12,
    destination_hospital_id VARCHAR(64) REFERENCES hospitals(id),
    destination_hospital_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Dispatched', -- 'Dispatched', 'En Route', 'Patient Picked', 'Arrived at Hospital', 'Resolved'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

