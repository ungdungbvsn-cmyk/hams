import { Request, Response } from 'express';
import prisma from '../prisma';
import { logActivity } from '../utils/logger';

export const getAssetStatuses = async (req: Request, res: Response) => {
  try {
    const statuses = await prisma.assetStatus.findMany({
      orderBy: { matt: 'asc' }
    });
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAssetStatus = async (req: Request, res: Response) => {
  try {
    const { matt, tentt } = req.body;
    const status = await prisma.assetStatus.create({
      data: {
        matt: Number(matt),
        tentt
      }
    });
    const userId = (req as any).user?.userId;
    await logActivity(userId, 'CREATE_STATUS', 'ASSET_STATUS', { matt: status.matt, tentt: status.tentt });
    res.status(201).json(status);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAssetStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tentt } = req.body;
    const status = await prisma.assetStatus.update({
      where: { matt: Number(id) },
      data: { tentt }
    });
    const userId = (req as any).user?.userId;
    await logActivity(userId, 'UPDATE_STATUS', 'ASSET_STATUS', { matt: status.matt, tentt: status.tentt });
    res.json(status);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAssetStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.assetStatus.delete({
      where: { matt: Number(id) }
    });
    const userId = (req as any).user?.userId;
    await logActivity(userId, 'DELETE_STATUS', 'ASSET_STATUS', { matt: Number(id) });
    res.json({ message: 'Status deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: 'Cannot delete status. It might be in use.' });
  }
};
