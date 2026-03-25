import { Request, Response } from 'express';
import prisma from '../prisma';
import { runBackup, scheduleBackup } from '../services/backupService';
import { logActivity } from '../utils/logger';

export const getBackupConfig = async (req: Request, res: Response) => {
  try {
    let config = await (prisma as any).backupConfig.findFirst();
    if (!config) {
      config = await (prisma as any).backupConfig.create({
        data: { storagePath: 'C:\\HAMS\\backups', autoBackup: false, schedule: '0 0 * * *' }
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBackupConfig = async (req: Request, res: Response) => {
  try {
    const { storagePath, autoBackup, schedule } = req.body;
    let config = await (prisma as any).backupConfig.findFirst();
    
    if (config) {
      config = await (prisma as any).backupConfig.update({
        where: { id: config.id },
        data: { storagePath, autoBackup, schedule }
      });
    } else {
      config = await (prisma as any).backupConfig.create({
        data: { storagePath, autoBackup, schedule }
      });
    }

    await scheduleBackup();
    const userId = (req as any).user?.userId;
    await logActivity(userId, 'CẬP NHẬT CẤU HÌNH SAO LƯU', 'HỆ THỐNG', { storagePath, autoBackup, schedule });
    
    res.json(config);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const triggerManualBackup = async (req: Request, res: Response) => {
  try {
    const result: any = await runBackup();
    if (result.error) {
      return res.status(500).json(result);
    }
    const userId = (req as any).user?.userId;
    await logActivity(userId, 'SAO LƯU THỦ CÔNG', 'HỆ THỐNG', { filename: result.filename });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Backup failed' });
  }
};

export const getBackupHistory = async (req: Request, res: Response) => {
  try {
    const history = await (prisma as any).backupHistory.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    // Convert BigInt to string for JSON serialization
    const serializedHistory = history.map((h: any) => ({
      ...h,
      size: h.size.toString()
    }));
    res.json(serializedHistory);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
