import { Router } from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplierController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getSuppliers);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createSupplier);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateSupplier);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteSupplier);

export default router;
