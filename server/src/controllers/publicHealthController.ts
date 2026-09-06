import { Request, Response } from 'express';
import { PublicHealthRepository } from '../database/repositories/PublicHealthRepository.js';
import { HospitalRepository } from '../database/repositories/HospitalRepository.js';

export class PublicHealthController {
  // 1. Digital Triage
  static async runTriage(req: Request, res: Response) {
    try {
      const {
        patientId,
        chiefComplaint,
        symptoms = [],
        vitals = {},
        mobilityStatus = 'Walkable',
        distanceKm = 15,
        hasCaregiver = true,
      } = req.body;

      if (!chiefComplaint) {
        return res.status(400).json({ success: false, message: 'Chief complaint is required' });
      }

      const complaintLower = chiefComplaint.toLowerCase();
      const symptomsStr = Array.isArray(symptoms) ? symptoms.join(' ').toLowerCase() : String(symptoms).toLowerCase();
      const combined = `${complaintLower} ${symptomsStr}`;

      // Acuity & Tier Logic
      let acuityLevel: 'Emergency' | 'Urgent' | 'Routine' | 'Preventive' = 'Routine';
      let recommendedTier = 'Primary Health Centre (PHC)';
      let triageNotes = '';
      const operationalBarriers: string[] = [];

      if (
        combined.includes('chest pain') ||
        combined.includes('heart') ||
        combined.includes('unconscious') ||
        combined.includes('severe bleeding') ||
        combined.includes('snake bite') ||
        combined.includes('stroke') ||
        combined.includes('paralysis') ||
        combined.includes('poison') ||
        combined.includes('accident')
      ) {
        acuityLevel = 'Emergency';
        recommendedTier = '108 Emergency / Trauma Care';
        triageNotes = 'CRITICAL EMERGENCY: Immediate paramedic dispatch and trauma care required. Do not travel via standard bus transit.';
      } else if (
        combined.includes('fracture') ||
        combined.includes('high fever') ||
        combined.includes('labor') ||
        combined.includes('pregnancy pain') ||
        combined.includes('severe abdominal') ||
        combined.includes('breathing difficulty') ||
        combined.includes('asthma') ||
        (vitals.bpSystolic && vitals.bpSystolic > 170)
      ) {
        acuityLevel = 'Urgent';
        recommendedTier = 'Rural Hospital (RH)';
        triageNotes = 'URGENT SPECIALIST CARE: Requires 24/7 doctor supervision, ultrasound, X-ray, or obstetric intervention at Rural Hospital.';
      } else if (
        combined.includes('fever') ||
        combined.includes('cough') ||
        combined.includes('vomiting') ||
        combined.includes('diarrhea') ||
        combined.includes('infection') ||
        combined.includes('hypertension') ||
        combined.includes('diabetes')
      ) {
        acuityLevel = 'Routine';
        recommendedTier = 'Primary Health Centre (PHC)';
        triageNotes = 'PRIMARY CLINICAL EVALUATION: Manageable at local PHC with MBBS Medical Officer and routine laboratory testing.';
      } else {
        acuityLevel = 'Preventive';
        recommendedTier = 'Sub-Centre / AAM';
        triageNotes = 'WELLNESS & PREVENTIVE: Suitable for Health & Wellness Centre (AAM) for vitals screening, dressing, or routine medicine refill.';
      }

      if (distanceKm > 25) operationalBarriers.push(`Long Distance (${distanceKm} km) - Travel voucher / assisted transport recommended`);
      if (mobilityStatus === 'Wheelchair' || mobilityStatus === 'Bedridden') operationalBarriers.push('Mobility Impairment - Ground floor OPD & Escort required');
      if (!hasCaregiver) operationalBarriers.push('No Caregiver - Patient Concierge or ASHA accompaniment requested');

      // Find suitable facility
      const allHospitals = await HospitalRepository.findAll();
      let matchedHosp = allHospitals.find(h => h.type.toLowerCase().includes(recommendedTier.toLowerCase()) || h.name.toLowerCase().includes(recommendedTier.toLowerCase()));
      if (!matchedHosp) {
        matchedHosp = allHospitals[0];
      }

      const triageRecord = await PublicHealthRepository.createTriage({
        patient_id: patientId || (req as any).user?.id,
        chief_complaint: chiefComplaint,
        acuity_level: acuityLevel,
        recommended_tier: recommendedTier,
        recommended_hospital_id: matchedHosp?.id,
        symptoms_json: JSON.stringify(symptoms),
        vitals_json: JSON.stringify(vitals),
        operational_barriers_json: JSON.stringify(operationalBarriers),
        triage_notes: triageNotes,
      });

      return res.status(200).json({
        success: true,
        data: {
          triage: triageRecord,
          recommendedFacility: matchedHosp,
          acuityLevel,
          recommendedTier,
          triageNotes,
          operationalBarriers,
          actionableSteps: [
            acuityLevel === 'Emergency' ? 'Call 108 immediately or click Emergency SOS button' : 'Book OPD Token at recommended facility',
            'Download/Show Digital Triage Pass to OPD Registration Desk for queue prioritization',
            'Consult with ASHA worker for free transport reimbursement if applicable',
          ],
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getPatientTriage(req: Request, res: Response) {
    try {
      const patientId = req.params.patientId || (req as any).user?.id;
      const records = await PublicHealthRepository.findTriageByPatient(patientId);
      return res.status(200).json({ success: true, data: records });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Referrals
  static async getReferrals(req: Request, res: Response) {
    try {
      const { patientId, facilityId } = req.query;
      const referrals = await PublicHealthRepository.getReferrals({
        patient_id: patientId ? String(patientId) : undefined,
        facility_id: facilityId ? String(facilityId) : undefined,
      });
      return res.status(200).json({ success: true, data: referrals });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createReferral(req: Request, res: Response) {
    try {
      const {
        patientId,
        patientName,
        fromFacilityId,
        fromFacilityName,
        fromTier,
        toFacilityId,
        toFacilityName,
        toTier,
        specialtyRequired,
        reasonForReferral,
        priority = 'Routine',
        transportMode = 'Public Bus',
      } = req.body;

      if (!patientName || !fromFacilityName || !toFacilityName || !reasonForReferral) {
        return res.status(400).json({ success: false, message: 'Missing mandatory referral parameters' });
      }

      const referral = await PublicHealthRepository.createReferral({
        patient_id: patientId || (req as any).user?.id || 'demo-patient',
        patient_name: patientName,
        from_facility_id: fromFacilityId || 'hosp-mh-phc-02',
        from_facility_name: fromFacilityName,
        from_tier: fromTier || 'Primary Health Centre (PHC)',
        to_facility_id: toFacilityId || 'hosp-mh-rh-03',
        to_facility_name: toFacilityName,
        to_tier: toTier || 'Rural Hospital (RH)',
        specialty_required: specialtyRequired || 'General Medicine',
        reason_for_referral: reasonForReferral,
        priority,
        transport_mode: transportMode,
        status: 'Initiated',
      });

      return res.status(201).json({ success: true, data: referral });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateReferralStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, counterReferralNotes } = req.body;
      const updated = await PublicHealthRepository.updateReferralStatus(id, status, counterReferralNotes);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Referral not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Health Records (Longitudinal & ABHA)
  static async getHealthRecords(req: Request, res: Response) {
    try {
      const patientId = req.params.patientId || (req as any).user?.id || 'demo-patient-sunita';
      const records = await PublicHealthRepository.getHealthRecords(patientId);
      return res.status(200).json({
        success: true,
        data: {
          abhaId: '91-4582-7391-2041@abdm',
          records,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createHealthRecord(req: Request, res: Response) {
    try {
      const {
        patientId,
        abhaId = '91-4582-7391-2041@abdm',
        facilityName,
        doctorName,
        recordType,
        recordDate,
        diagnosis,
        vitals,
        prescription,
        notes,
      } = req.body;

      const record = await PublicHealthRepository.createHealthRecord({
        patient_id: patientId || (req as any).user?.id || 'demo-patient-sunita',
        abha_id: abhaId,
        facility_name: facilityName || 'Sub-District Hospital Karad',
        doctor_name: doctorName || 'Dr. Medical Officer, MBBS',
        record_type: recordType || 'OPD Consultation',
        record_date: recordDate || new Date().toISOString().split('T')[0],
        diagnosis: diagnosis || 'Clinical Health Assessment',
        vitals_json: vitals ? JSON.stringify(vitals) : undefined,
        prescription_json: prescription ? JSON.stringify(prescription) : undefined,
        notes,
        fhir_bundle_json: JSON.stringify({ resourceType: 'Bundle', type: 'document', timestamp: new Date().toISOString() }),
      });

      return res.status(201).json({ success: true, data: record });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 4. Diagnostics & Equipment Uptime
  static async getDiagnostics(req: Request, res: Response) {
    try {
      const { facilityId } = req.query;
      const tests = await PublicHealthRepository.getDiagnostics(facilityId ? String(facilityId) : undefined);
      return res.status(200).json({ success: true, data: tests });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async bookDiagnostic(req: Request, res: Response) {
    try {
      const { diagnosticId, patientName, facilityName, testName, scheduledDate } = req.body;
      const booking = await PublicHealthRepository.createDiagnosticBooking({
        diagnostic_id: diagnosticId || 'dx-1',
        patient_id: (req as any).user?.id || 'demo-patient-sunita',
        patient_name: patientName || 'Sunita Devi',
        facility_name: facilityName || 'Primary Health Centre (PHC) Mahabaleshwar',
        test_name: testName || 'Complete Blood Count (CBC)',
        scheduled_date: scheduledDate || new Date().toISOString().split('T')[0],
      });
      return res.status(201).json({ success: true, data: booking });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getDiagnosticBookings(req: Request, res: Response) {
    try {
      const patientId = req.query.patientId ? String(req.query.patientId) : (req as any).user?.id;
      const bookings = await PublicHealthRepository.getDiagnosticBookings(patientId);
      return res.status(200).json({ success: true, data: bookings });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 5. Essential Medicines (e-Aushadhi)
  static async getMedicines(req: Request, res: Response) {
    try {
      const { facilityId, search, category, status } = req.query;
      const meds = await PublicHealthRepository.getMedicines({
        facilityId: facilityId ? String(facilityId) : undefined,
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
        status: status ? String(status) : undefined,
      });
      return res.status(200).json({ success: true, data: meds });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 6. High-Risk Registry
  static async getHighRiskRegistry(req: Request, res: Response) {
    try {
      const { patientId, cohort } = req.query;
      const list = await PublicHealthRepository.getHighRiskRegistry({
        patient_id: patientId ? String(patientId) : undefined,
        cohort: cohort ? String(cohort) : undefined,
      });
      return res.status(200).json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createHighRiskEntry(req: Request, res: Response) {
    try {
      const {
        patientName,
        cohortType,
        riskLevel = 'Moderate',
        primaryCondition,
        currentMilestone,
        nextDueDate,
        assignedAshaName,
        followUpNotes,
      } = req.body;

      const entry = await PublicHealthRepository.createHighRiskEntry({
        patient_id: (req as any).user?.id || 'demo-patient-sunita',
        patient_name: patientName,
        cohort_type: cohortType,
        risk_level: riskLevel,
        primary_condition: primaryCondition,
        current_milestone: currentMilestone,
        next_due_date: nextDueDate,
        status: 'Active',
        assigned_asha_name: assignedAshaName,
        follow_up_notes: followUpNotes,
      });
      return res.status(201).json({ success: true, data: entry });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateHighRiskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, followUpNotes } = req.body;
      const updated = await PublicHealthRepository.updateHighRiskStatus(id, status, followUpNotes);
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 7. Frontline Tasks (ASHA / ANM / CHO)
  static async getFrontlineTasks(req: Request, res: Response) {
    try {
      const { workerId } = req.query;
      const tasks = await PublicHealthRepository.getFrontlineTasks(workerId ? String(workerId) : undefined);
      return res.status(200).json({ success: true, data: tasks });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createFrontlineTask(req: Request, res: Response) {
    try {
      const task = await PublicHealthRepository.createFrontlineTask(req.body);
      return res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateFrontlineTaskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const updated = await PublicHealthRepository.updateFrontlineTaskStatus(id, status, notes);
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 8. Emergency 108 SOS Dispatch
  static async triggerEmergencySOS(req: Request, res: Response) {
    try {
      const {
        patientName = 'Citizen in Need',
        phone = '98220-11111',
        locationName = 'Live GPS Location (Rural Satara)',
        latitude = 17.7285,
        longitude = 73.8377,
        emergencyType = 'Cardiac / Acute Emergency',
      } = req.body;

      const allHospitals = await HospitalRepository.findAll();
      const emergencyFacility = allHospitals.find(h => h.emergency_24x7 && (h.type.includes('District') || h.type.includes('Rural'))) || allHospitals[0];

      const dispatch = await PublicHealthRepository.createEmergencyDispatch({
        patient_name: patientName,
        phone,
        location_name: locationName,
        latitude,
        longitude,
        emergency_type: emergencyType,
        assigned_ambulance_vehicle: 'MH-11-AX-1081 (ALS 108 Advanced Ambulance)',
        eta_minutes: 9,
        destination_hospital_id: emergencyFacility?.id,
        destination_hospital_name: emergencyFacility?.name || 'District Civil Hospital Satara',
        status: 'Dispatched',
      });

      return res.status(200).json({
        success: true,
        data: {
          dispatch,
          ambulanceCallNumber: '108',
          instructions: 'Keep the patient warm and seated. Paramedic team has been notified with your GPS coordinates.',
          etaMinutes: 9,
          destinationHospital: emergencyFacility,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 9. Facility Quality & Metrics Dashboard
  static async getFacilityMetrics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const hospital = await HospitalRepository.findById(id);
      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }

      const services = await HospitalRepository.getServicesByHospital(id);
      const diagnostics = await PublicHealthRepository.getDiagnostics(id);
      const medicines = await PublicHealthRepository.getMedicines({ facilityId: id });

      const functionalDiagCount = diagnostics.filter(d => d.is_equipment_functional).length;
      const diagUptime = diagnostics.length > 0 ? Math.round((functionalDiagCount / diagnostics.length) * 100) : 95;

      const inStockMeds = medicines.filter(m => m.status === 'In Stock').length;
      const medStockIndex = medicines.length > 0 ? Math.round((inStockMeds / medicines.length) * 100) : 92;

      return res.status(200).json({
        success: true,
        data: {
          facility: hospital,
          departments: services,
          totalBeds: hospital.total_beds,
          availableBeds: hospital.available_beds,
          bedOccupancyPercent: Math.round(((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100),
          diagnosticUptimePercent: diagUptime,
          essentialMedicineStockPercent: medStockIndex,
          nqasScore: 94,
          dailyOpdFootfall: 280,
          averageWaitTimeMinutes: 22,
          qualityStandards: [
            { category: 'Hygiene & Cleanliness (Kayakalp)', score: '95/100', status: 'Compliant' },
            { category: 'Specialist Doctor Punctuality', score: '91/100', status: 'Compliant' },
            { category: 'Medicine Availability Index', score: `${medStockIndex}%`, status: medStockIndex > 80 ? 'Optimal' : 'Needs Restock' },
            { category: 'Diagnostic Turnaround Time', score: '< 3 Hours', status: 'Optimal' },
            { category: 'Citizen Grievance Redressal Rate', score: '98.2%', status: 'Compliant' },
          ],
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
