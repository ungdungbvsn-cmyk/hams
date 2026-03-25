import { Router } from 'express';
import { getAssetsForCalibration, addCalibrationRecord } from '../controllers/calibrationController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAssetsForCalibration);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), addCalibrationRecord);

export default router;
