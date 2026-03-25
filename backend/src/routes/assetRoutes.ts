import { Router } from 'express';
import { getAssets, getAssetById, createAsset, updateAsset, deleteAsset, reportBreakdown, transferAsset, liquidateAsset, exportAssets, getImportTemplate } from '../controllers/assetController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/export', authorizeRoles('ADMIN', 'MANAGER'), exportAssets);
router.get('/import-template/:type', getImportTemplate);
router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createAsset);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateAsset);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteAsset);
router.post('/:id/report-breakdown', reportBreakdown);
router.post('/:id/transfer', transferAsset);
router.post('/:id/liquidate', liquidateAsset);

export default router;
