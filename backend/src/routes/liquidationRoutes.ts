import express from 'express';
import { getLiquidations, completeLiquidation, revertLiquidation } from '../controllers/liquidationController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', getLiquidations);
router.put('/:id/complete', completeLiquidation);
router.delete('/:id/revert', revertLiquidation);

export default router;
