import { Router } from 'express';
import { getDepartments, getSuppliers, getEquipmentTypesMaster } from '../controllers/masterDataController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/departments', getDepartments);
router.get('/suppliers', getSuppliers);
router.get('/categories', getEquipmentTypesMaster);

export default router;
