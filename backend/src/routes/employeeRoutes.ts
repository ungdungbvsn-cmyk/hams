import { Router } from 'express';
import { 
    getEmployees, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee, 
    transferEmployee,
    getEmployeeTransferHistory,
    updateTransfer
} from '../controllers/employeeController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getEmployees);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createEmployee);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateEmployee);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteEmployee);

router.post('/:id/transfer', authorizeRoles('ADMIN', 'MANAGER'), transferEmployee);
router.get('/:id/transfer-history', authorizeRoles('ADMIN', 'MANAGER'), getEmployeeTransferHistory);
router.put('/transfer/:historyId', authorizeRoles('ADMIN', 'MANAGER'), updateTransfer);

export default router;
