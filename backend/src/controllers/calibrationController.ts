import { Request, Response } from 'express';
import prisma from '../prisma';
import { logActivity } from '../utils/auditLogger';

export const getAssetsForCalibration = async (req: Request, res: Response) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { requiresCalibration: true },
      include: {
        equipmentType: true,
        department: true,
        calibrations: {
          orderBy: { calibrationDate: 'desc' },
          take: 1
        }
      },
      orderBy: { 
        nextCalibrationDate: { sort: 'asc', nulls: 'first' }
      }
    });
    res.json(assets);
  } catch (error) {
    console.error('Fetch Calibration Assets Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addCalibrationRecord = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assetId, calibrationDate, expirationDate, result, certificateUrl, notes, performedBy } = req.body;

    const calDate = new Date(calibrationDate);
    const expDate = new Date(expirationDate);

    if (isNaN(calDate.getTime()) || isNaN(expDate.getTime())) {
      return res.status(400).json({ error: 'Ngày tháng không hợp lệ' });
    }

    const record = await prisma.calibrationRecord.create({
      data: {
        assetId: Number(assetId),
        calibrationDate: calDate,
        expirationDate: expDate,
        result: result || 'PASS',
        certificateUrl,
        notes,
        performedBy
      }
    });

    // Update Asset
    await prisma.asset.update({
      where: { id: Number(assetId) },
      data: {
        lastCalibrationDate: calDate,
        nextCalibrationDate: expDate
      }
    });

    const userId = (req as any).user?.userId;
    await logActivity(userId, 'CẬP NHẬT HIỆU CHUẨN', 'HIỆU CHUẨN', { assetId, result });

    res.status(201).json(record);
  } catch (error: any) {
    console.error('Add Calibration Record Error:', error);
    res.status(400).json({ error: error.message });
  }
};
