import { Request, Response } from 'express';
import prisma from '../prisma';
import { logActivity } from '../utils/auditLogger';

export const getMaintenances = async (req: Request, res: Response) => {
  try {
    const records = await prisma.maintenanceRecord.findMany({
      include: { 
        asset: { include: { equipmentType: true, department: true } }, 
        creator: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải danh sách phiếu sửa chữa' });
  }
};

export const createMaintenance = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, name, assetId, description, cost, startDate, endDate, status, contractorName } = req.body;
    
    // Auto-generate code if empty
    const finalCode = code || `SC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const employee = await prisma.employee.findUnique({ where: { userId: (req as any).user.userId } });

    const record = await prisma.maintenanceRecord.create({
      data: {
        code: finalCode,
        name,
        assetId: Number(assetId),
        description,
        cost: cost ? parseFloat(cost) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'PENDING',
        contractorName,
        creatorId: employee?.id || null
      }
    });

    if (status !== 'COMPLETED') {
       await prisma.asset.update({ where: { id: Number(assetId) }, data: { statusId: 4 }}); // MAINTENANCE -> 4
    }

    await prisma.assetHistory.create({
      data: {
        assetId: Number(assetId),
        actionType: 'MAINTENANCE_START',
        description: `Tạo phiếu SC/BT: ${name} (${finalCode})`,
        performedById: employee?.id || 1
      }
    });

    const userId = (req as any).user?.userId;
    await logActivity(userId, 'TẠO PHIẾU SỬA CHỮA', 'BẢO TRÌ/SỬA CHỮA', { code: finalCode, name });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMaintenance = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { code, name, assetId, description, cost, startDate, endDate, status, contractorName } = req.body;

    const record = await prisma.maintenanceRecord.update({
      where: { id: Number(id) },
      data: { 
        code, name, assetId: Number(assetId), description,
        cost: cost ? parseFloat(cost) : null,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        status, contractorName 
      }
    });

    const employee = await prisma.employee.findUnique({ where: { userId: (req as any).user.userId } });

    if (status === 'COMPLETED') {
       await prisma.asset.update({ where: { id: Number(assetId) }, data: { statusId: 0 }}); // AVAILABLE -> 0
       await prisma.assetHistory.create({
         data: {
           assetId: Number(assetId),
           actionType: 'MAINTENANCE_END',
           description: `Hoàn thành sửa chữa: ${name} (${code})`,
           performedById: employee?.id || 1
         }
       });
    } else {
       await prisma.asset.update({ where: { id: Number(assetId) }, data: { statusId: 4 }}); // MAINTENANCE -> 4
    }

    const userId = (req as any).user?.userId;
    await logActivity(userId, 'CẬP NHẬT PHIẾU SỬA CHỮA', 'BẢO TRÌ/SỬA CHỮA', { id, code, status });

    res.json(record);
  } catch (error: any) {
    res.status(400).json({ error: 'Lỗi cập nhật phiếu sửa chữa.' });
  }
};

export const deleteMaintenance = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.maintenanceRecord.delete({ where: { id: Number(id) } });
    const userId = (req as any).user?.userId;
    await logActivity(userId, 'XÓA PHIẾU SỬA CHỮA', 'BẢO TRÌ/SỬA CHỮA', { id });

    res.json({ message: 'Đã xóa phiếu' });
  } catch (error: any) {
    res.status(400).json({ error: 'Lỗi khi xóa phiếu sửa chữa.' });
  }
};
// Hooks synchronized with backend
// TS cache hook
