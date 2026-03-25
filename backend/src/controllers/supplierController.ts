import { Request, Response } from 'express';
import prisma from '../prisma';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSupplier = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, name, contact, email, phone, status } = req.body;
    
    const existing = await prisma.supplier.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Tên nhà cung cấp đã tồn tại.' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        code: code || undefined,
        name,
        contact,
        email,
        phone,
        status: status || 'ACTIVE'
      }
    });

    res.status(201).json(supplier);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Mã hoặc tên NCC đã tồn tại.' });
    res.status(400).json({ error: error.message });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { code, name, contact, email, phone, status } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: Number(id) },
      data: { code, name, contact, email, phone, status }
    });

    res.json(supplier);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Mã hoặc tên NCC bị trùng lặp.' });
    res.status(400).json({ error: 'Lỗi khi cập nhật thông tin nhà cung cấp.' });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    // Validate cascading deletion
    const assetsCount = await prisma.asset.count({ where: { supplierId: Number(id) } });
    if (assetsCount > 0) {
      return res.status(400).json({ error: `Không thể xoá. Nhà cung cấp này đang được sử dụng ở ${assetsCount} Thiết bị/Tài sản.` });
    }

    await prisma.supplier.delete({ where: { id: Number(id) } });
    res.json({ message: 'Đã xóa Nhà Cung Cấp.' });
  } catch (error: any) {
    res.status(400).json({ error: 'Lỗi khi xóa nhà cung cấp.' });
  }
};
// Triggering backend restart to clear TypeScript cache
