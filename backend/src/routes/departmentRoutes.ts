import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createDepartment);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateDepartment);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteDepartment);

export default router;
