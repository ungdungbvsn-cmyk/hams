import { Router } from 'express';
import authRoutes from './authRoutes';
import masterDataRoutes from './masterDataRoutes';
import assetRoutes from './assetRoutes';
import movementRoutes from './movementRoutes';
import ticketRoutes from './ticketRoutes';
import aiRoutes from './aiRoutes';
import supplierRoutes from './supplierRoutes';
import departmentRoutes from './departmentRoutes';
import employeeRoutes from './employeeRoutes';
import maintenanceRoutes from './maintenanceRoutes';
import timekeepingSymbolRoutes from './timekeepingSymbolRoutes';
import timekeepingRoutes from './timekeepingRoutes';
import equipmentTypeRoutes from './equipmentTypeRoutes';
import calibrationRoutes from './calibrationRoutes';
import dashboardRoutes from './dashboardRoutes';
import userRoutes from './userRoutes';
import liquidationRoutes from './liquidationRoutes';
import assetStatusRoutes from './assetStatusRoutes';
import activityLogRoutes from './activityLogRoutes';
import backupRoutes from './backupRoutes';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to HAMS API' });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/master', masterDataRoutes);
router.use('/assets', assetRoutes);
router.use('/movements', movementRoutes);
router.use('/tickets', ticketRoutes);
router.use('/ai', aiRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/departments', departmentRoutes);
router.use('/employees', employeeRoutes);
router.use('/maintenances', maintenanceRoutes);
router.use('/timekeeping-symbols', timekeepingSymbolRoutes);
router.use('/timekeeping', timekeepingRoutes);
router.use('/equipment-types', equipmentTypeRoutes);
router.use('/calibrations', calibrationRoutes);
router.use('/users', userRoutes);
router.use('/liquidations', liquidationRoutes);
router.use('/asset-statuses', assetStatusRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/backups', backupRoutes);

export default router;
