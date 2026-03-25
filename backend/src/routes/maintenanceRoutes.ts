import { Router } from 'express';
import { getMaintenances, createMaintenance, updateMaintenance, deleteMaintenance } from '../controllers/maintenanceController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getMaintenances);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createMaintenance);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateMaintenance);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteMaintenance);

export default router;
