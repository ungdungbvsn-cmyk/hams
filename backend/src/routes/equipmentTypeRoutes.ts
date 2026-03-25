import { Router } from 'express';
import { getEquipmentTypes, createEquipmentType, updateEquipmentType, deleteEquipmentType } from '../controllers/equipmentTypeController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getEquipmentTypes);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createEquipmentType);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateEquipmentType);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteEquipmentType);

export default router;
