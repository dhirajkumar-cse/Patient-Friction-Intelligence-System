import { Router } from 'express';
import { PatientController } from '../controllers/patientController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/me', requireRole('patient'), PatientController.getMe);
router.put('/me', requireRole('patient'), PatientController.updateProfile);
router.get('/me/friction', requireRole('patient'), PatientController.getFrictionProfile);
router.get('/me/risk', requireRole('patient'), PatientController.getAccessibilityRisk);
router.get('/me/journey', requireRole('patient'), PatientController.getCareJourney);

export default router;
