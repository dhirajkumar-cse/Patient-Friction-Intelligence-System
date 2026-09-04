import { Router } from 'express';
import { HospitalController } from '../controllers/hospitalController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Public endpoints (or patient hospital finder)
router.get('/nearby', HospitalController.getNearby);
router.get('/search', HospitalController.search);
router.get('/:id', HospitalController.getById);

// Hospital Protected
router.get('/profile/me', authenticate, requireRole('hospital'), HospitalController.getMyProfile);
router.put('/profile/me', authenticate, requireRole('hospital'), HospitalController.updateProfile);

export default router;
