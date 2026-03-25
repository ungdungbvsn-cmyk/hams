import { Router } from 'express';
import { getBackupConfig, updateBackupConfig, triggerManualBackup, getBackupHistory } from '../controllers/backupController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/config', getBackupConfig);
router.put('/config', updateBackupConfig);
router.post('/trigger', triggerManualBackup);
router.get('/history', getBackupHistory);

export default router;
