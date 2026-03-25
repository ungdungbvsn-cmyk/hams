import { Request, Response } from 'express';
import prisma from '../prisma';

export const getEquipmentTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.equipmentType.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải danh mục loại thiết bị' });
  }
};

export const createEquipmentType = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, name, description } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({ error: 'Mã loại và Tên loại là bắt buộc.' });
    }

    const existingCode = await prisma.equipmentType.findUnique({ where: { code } });
    if (existingCode) return res.status(400).json({ error: 'Mã loại thiết bị đã tồn tại.' });

    const type = await prisma.equipmentType.create({
      data: { code, name, description }
    });

    res.status(201).json(type);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Mã loại thiết bị đã tồn tại.' });
    res.status(400).json({ error: error.message });
  }
};

export const updateEquipmentType = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;

    const type = await prisma.equipmentType.update({
      where: { id: Number(id) },
      data: { code, name, description }
    });

    res.json(type);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Mã loại thiết bị bị trùng lặp.' });
    res.status(400).json({ error: 'Lỗi cập nhật loại thiết bị.' });
  }
};

export const deleteEquipmentType = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    // Check if any assets belong to this type
    const assetsCount = await prisma.asset.count({ where: { equipmentTypeId: Number(id) } });
    if (assetsCount > 0) {
        return res.status(400).json({ error: 'Không thể xóa loại thiết bị này vì đã có tài sản thuộc loại này.' });
    }

    await prisma.equipmentType.delete({ where: { id: Number(id) } });
    res.json({ message: 'Đã xóa loại thiết bị' });
  } catch (error: any) {
    res.status(400).json({ error: 'Lỗi khi xóa loại thiết bị.' });
  }
};
// TS Reset hook
