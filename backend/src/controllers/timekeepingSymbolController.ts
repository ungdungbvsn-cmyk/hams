import { Request, Response } from 'express';
import prisma from '../prisma';

export const getSymbols = async (req: Request, res: Response) => {
  try {
    const symbols = await prisma.timekeepingSymbol.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(symbols);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải danh mục ký hiệu chấm công' });
  }
};

export const createSymbol = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, name } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({ error: 'Mã ký hiệu và Tên ký hiệu là bắt buộc.' });
    }

    const existingCode = await prisma.timekeepingSymbol.findUnique({ where: { code } });
    if (existingCode) return res.status(400).json({ error: 'Mã ký hiệu đã tồn tại.' });

    const symbol = await prisma.timekeepingSymbol.create({
      data: { code, name }
    });

    res.status(201).json(symbol);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Mã ký hiệu đã tồn tại.' });
    res.status(400).json({ error: error.message });
  }
};

export const updateSymbol = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    const symbol = await prisma.timekeepingSymbol.update({
      where: { id: Number(id) },
      data: { code, name }
    });

    res.json(symbol);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Mã ký hiệu bị trùng lặp.' });
    res.status(400).json({ error: 'Lỗi cập nhật ký hiệu chấm công.' });
  }
};

export const deleteSymbol = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    await prisma.timekeepingSymbol.delete({ where: { id: Number(id) } });
    res.json({ message: 'Đã xóa ký hiệu chấm công' });
  } catch (error: any) {
    res.status(400).json({ error: 'Lỗi khi xóa ký hiệu.' });
  }
};
// TS Reset hook
