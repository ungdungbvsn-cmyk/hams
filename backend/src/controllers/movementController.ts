import { Request, Response } from 'express';
import prisma from '../prisma';

export const assignAsset = async (req: any, res: Response): Promise<any> => {
  try {
    const { assetId, employeeId } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id: Number(assetId) } });
    if (!asset || asset.statusId !== 0) { // AVAILABLE -> 0
      return res.status(400).json({ error: 'Asset is not available for assignment.' });
    }

    const currentEmp = await prisma.employee.findUnique({ where: { userId: req.user.userId } });
    const performerId = currentEmp?.id || 1;

    const assignment = await prisma.$transaction(async (tx) => {
      // Create assignment record
      const newAssignment = await tx.assetAssignment.create({
        data: {
          assetId: Number(assetId),
          employeeId: Number(employeeId),
          status: 'ACTIVE'
        }
      });

      // Update asset status
      await tx.asset.update({
        where: { id: Number(assetId) },
        data: { statusId: 0 } // IN_USE maps to 0
      });

      // Log history
      await tx.assetHistory.create({
        data: {
          assetId: Number(assetId),
          actionType: 'ASSIGN',
          description: `Bàn giao cho nhân viên ID: ${employeeId}`,
          performedById: performerId
        }
      });

      return newAssignment;
    });

    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const revokeAsset = async (req: any, res: Response): Promise<any> => {
  try {
    const { assetId, condition } = req.body;

    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: { assetId: Number(assetId), status: 'ACTIVE' }
    });

    if (!activeAssignment) {
      return res.status(400).json({ error: 'No active assignment found for this asset.' });
    }

    const currentEmp = await prisma.employee.findUnique({ where: { userId: req.user.userId } });
    const performerId = currentEmp?.id || 1;

    await prisma.$transaction(async (tx) => {
      // Close assignment
      await tx.assetAssignment.update({
        where: { id: activeAssignment.id },
        data: { status: 'RETURNED', returnDate: new Date() }
      });

      // Update asset status
      const newStatusId = condition === 'BROKEN' ? 1 : 0;
      await tx.asset.update({
        where: { id: Number(assetId) },
        data: { statusId: newStatusId }
      });

      // Log history
      await tx.assetHistory.create({
        data: {
          assetId: Number(assetId),
          actionType: 'RETURN',
          description: `Thu hồi tài sản. Tình trạng: ${condition}`,
          performedById: performerId
        }
      });
    });

    res.json({ message: 'Asset successfully revoked.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAssetHistory = async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const history = await prisma.assetHistory.findMany({
      where: { assetId: Number(assetId) },
      include: { performedBy: { include: { user: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
