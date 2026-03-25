import { Router } from 'express';
import { getActivityLogs } from '../controllers/activityLogController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN')); // Only admin can see logs

router.get('/', getActivityLogs);

export default router;
