import { Router } from 'express';
import { getAssetInsights, chatWithAI } from '../controllers/aiController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.post('/insights', getAssetInsights);
router.post('/chat', chatWithAI);

export default router;
