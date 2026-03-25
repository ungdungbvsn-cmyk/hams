import { Request, Response } from 'express';
import prisma from '../prisma';

export const getLiquidations = async (req: Request, res: Response) => {
  try {
    const liquidations = await prisma.liquidationRecord.findMany({
      include: {
        asset: {
          include: { department: true, equipmentType: true }
        },
        creator: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(liquidations);
  } catch (error) {
    console.error('Lỗi lấy danh sách thanh lý:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const completeLiquidation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { documentUrl, reason } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ error: 'Vui lòng cung cấp link hồ sơ thanh lý' });
    }

    const liquidation = await prisma.liquidationRecord.findUnique({ where: { id: Number(id) } });
    if (!liquidation) return res.status(404).json({ error: 'Không tìm thấy hồ sơ thanh lý' });

    const userId = (req as any).user?.userId;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    let performerId = employee?.id;
    if (!performerId) {
      const fallbackEmp = await prisma.employee.findFirst();
      performerId = fallbackEmp?.id;
    }

    await prisma.$transaction(async (tx) => {
      await tx.liquidationRecord.update({
        where: { id: Number(id) },
        data: {
          status: 'COMPLETED',
          documentUrl,
          reason: reason || liquidation.reason
        }
      });

      if (performerId) {
        await tx.assetHistory.create({
          data: {
            assetId: liquidation.assetId,
            actionType: 'LIQUIDATE_COMPLETED',
            description: `Hoàn tất thanh lý. Link hồ sơ: ${documentUrl}`,
            performedById: performerId
          }
        });
      }
    });

    res.json({ message: 'Đã hoàn tất thanh lý tài sản' });
  } catch (error) {
    console.error('Lỗi hoàn tất thanh lý:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const revertLiquidation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const liquidation = await prisma.liquidationRecord.findUnique({ where: { id: Number(id) } });
    if (!liquidation) return res.status(404).json({ error: 'Không tìm thấy hồ sơ thanh lý' });
    if (liquidation.status === 'COMPLETED') return res.status(400).json({ error: 'Không thể hoàn lại hồ sơ đã hoàn tất' });

    const userId = (req as any).user?.userId;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    const performerId = employee?.id;

    await prisma.$transaction(async (tx) => {
      await tx.liquidationRecord.delete({ where: { id: Number(id) } });
      await tx.asset.update({
        where: { id: liquidation.assetId },
        data: { statusId: 1 } // BROKEN -> 1
      });

      if (performerId) {
        await tx.assetHistory.create({
          data: {
            assetId: liquidation.assetId,
            actionType: 'RESTORE',
            description: `Hoàn lại từ danh sách chờ thanh lý. Khôi phục trạng thái Hỏng.`,
            performedById: performerId
          }
        });
      }
    });

    res.json({ message: 'Đã hoàn lại trạng thái thiết bị' });
  } catch (error) {
    console.error('Lỗi hoàn lại thanh lý:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};
