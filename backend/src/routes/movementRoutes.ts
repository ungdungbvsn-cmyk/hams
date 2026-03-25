import { Router } from 'express';
import { assignAsset, revokeAsset, getAssetHistory } from '../controllers/movementController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/history/:assetId', getAssetHistory);
router.post('/assign', authorizeRoles('ADMIN', 'MANAGER'), assignAsset);
router.post('/revoke', authorizeRoles('ADMIN', 'MANAGER'), revokeAsset);

export default router;
