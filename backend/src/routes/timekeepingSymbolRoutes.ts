import { Router } from 'express';
import { getSymbols, createSymbol, updateSymbol, deleteSymbol } from '../controllers/timekeepingSymbolController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getSymbols);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createSymbol);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateSymbol);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteSymbol);

export default router;
