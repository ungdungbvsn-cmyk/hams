import { Router } from 'express';
import { getTimekeepingByDepartment, saveBatchTimekeeping, getTimekeepingTimeline, getTimekeepingStats, getPreviousDayTimekeeping } from '../controllers/timekeepingController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// All users can manage timekeeping, but controller logic enforces limits
router.get('/', getTimekeepingByDepartment);
router.get('/timeline', getTimekeepingTimeline);
router.get('/stats', getTimekeepingStats);
router.get('/previous-day', getPreviousDayTimekeeping);
router.post('/batch', saveBatchTimekeeping);

export default router;
