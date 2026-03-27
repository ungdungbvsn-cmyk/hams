import { Router } from 'express';
import { getDepartments, getSuppliers, getEquipmentTypesMaster, getUnifiedMasterData } from '../controllers/masterDataController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/departments', getDepartments);
router.get('/suppliers', getSuppliers);
router.get('/categories', getEquipmentTypesMaster);
router.get('/unified', getUnifiedMasterData);

export default router;
