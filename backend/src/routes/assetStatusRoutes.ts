import { Router } from 'express';
import { getAssetStatuses, createAssetStatus, updateAssetStatus, deleteAssetStatus } from '../controllers/assetStatusController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAssetStatuses);
router.post('/', authorizeRoles('ADMIN'), createAssetStatus);
router.put('/:id', authorizeRoles('ADMIN'), updateAssetStatus);
router.delete('/:id', authorizeRoles('ADMIN'), deleteAssetStatus);

export default router;
