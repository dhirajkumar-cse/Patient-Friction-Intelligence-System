import { Router } from 'express';
import { PublicHealthController } from '../controllers/publicHealthController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// 1. Digital Triage
router.post('/triage', PublicHealthController.runTriage);
router.get('/triage/patient/:patientId?', authenticate, PublicHealthController.getPatientTriage);

// 2. Multi-tier Referrals
router.get('/referrals', PublicHealthController.getReferrals);
router.post('/referrals', PublicHealthController.createReferral);
router.patch('/referrals/:id/status', PublicHealthController.updateReferralStatus);

// 3. Longitudinal Health Records & ABHA
router.get('/records/:patientId?', PublicHealthController.getHealthRecords);
router.post('/records', PublicHealthController.createHealthRecord);

// 4. Diagnostics & Equipment Status
router.get('/diagnostics', PublicHealthController.getDiagnostics);
router.post('/diagnostics/book', PublicHealthController.bookDiagnostic);
router.get('/diagnostics/bookings', PublicHealthController.getDiagnosticBookings);

// 5. Essential Medicines (e-Aushadhi Inventory)
router.get('/medicines', PublicHealthController.getMedicines);

// 6. High-Risk Registry (Maternal, Child, NCD)
router.get('/high-risk', PublicHealthController.getHighRiskRegistry);
router.post('/high-risk', PublicHealthController.createHighRiskEntry);
router.patch('/high-risk/:id/status', PublicHealthController.updateHighRiskStatus);

// 7. Frontline Tasks (ASHA / ANM / CHO)
router.get('/frontline/tasks', PublicHealthController.getFrontlineTasks);
router.post('/frontline/tasks', PublicHealthController.createFrontlineTask);
router.patch('/frontline/tasks/:id/status', PublicHealthController.updateFrontlineTaskStatus);

// 8. Emergency 108 SOS Dispatch
router.post('/emergency/sos', PublicHealthController.triggerEmergencySOS);

// 9. Facility Quality & NQAS Metrics
router.get('/facilities/:id/metrics', PublicHealthController.getFacilityMetrics);

export default router;
