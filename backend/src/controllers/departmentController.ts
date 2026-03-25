import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, name, description } = req.body;
    
    // Check if name already exists
    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Tên khoa phòng đã tồn tại.' });
    }

    const department = await prisma.department.create({
      data: {
        code: code || undefined,
        name,
        description
      }
    });

    res.status(201).json(department);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Mã hoặc tên Khoa phòng đã tồn tại.' });
    res.status(400).json({ error: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;

    const department = await prisma.department.update({
      where: { id: Number(id) },
      data: { code, name, description }
    });

    res.json(department);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Mã hoặc tên Khoa phòng bị trùng lặp.' });
    res.status(400).json({ error: 'Lỗi khi cập nhật thông tin khoa phòng.' });
  }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    // Validate cascading deletion
    const assetsCount = await prisma.asset.count({ where: { departmentId: Number(id) } });
    if (assetsCount > 0) {
      return res.status(400).json({ error: `Không thể xoá. Khoa phòng này đang quản lý ${assetsCount} Thiết bị/Tài sản.` });
    }

    const employeesCount = await prisma.employee.count({ where: { departmentId: Number(id) } });
    if (employeesCount > 0) {
      return res.status(400).json({ error: `Không thể xoá. Khoa phòng này đang có ${employeesCount} Nhân viên trực thuộc.` });
    }

    await prisma.department.delete({ where: { id: Number(id) } });
    res.json({ message: 'Đã xóa Khoa phòng.' });
  } catch (error: any) {
    res.status(400).json({ error: 'Lỗi khi xóa Khoa phòng.' });
  }
};
// Fixing Prisma TS Definitions
// Triggering backend restart to clear TypeScript cache
