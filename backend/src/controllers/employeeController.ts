import { Request, Response } from 'express';
import prisma from '../prisma';
import { logActivity } from '../utils/auditLogger';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.query;
    const filter: any = {};
    if (departmentId && departmentId !== 'undefined' && departmentId !== '') {
      filter.departmentId = Number(departmentId);
    }

    const employees = await prisma.employee.findMany({
      where: filter,
      include: { department: true },
      orderBy: { fullName: 'asc' }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải danh sách nhân viên' });
  }
};

export const createEmployee = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, fullName, email, phone, position, status, startDate, endDate, departmentId } = req.body;
    const userId = (req as any).user?.userId;

    if (!code || !fullName || !departmentId) {
      return res.status(400).json({ error: 'Mã, tên và Khoa phòng là bắt buộc.' });
    }

    const existingCode = await prisma.employee.findUnique({ where: { code } });
    if (existingCode) return res.status(400).json({ error: 'Mã nhân viên đã tồn tại.' });

    const employee = await prisma.$transaction(async (tx) => {
      const newEmp = await tx.employee.create({
        data: {
          code,
          fullName,
          email: email || `${code}@hospital.local`,
          phone,
          position,
          status: status || 'ACTIVE',
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          departmentId: Number(departmentId)
        }
      });

      // Create initial department history
      await tx.departmentHistory.create({
        data: {
          employeeId: newEmp.id,
          departmentId: Number(departmentId),
          startDate: startDate ? new Date(startDate) : new Date(),
        }
      });

      return newEmp;
    });

    await logActivity(userId, 'THÊM NHÂN VIÊN', 'NHÂN VIÊN', { code, fullName });
    res.status(201).json(employee);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateEmployee = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { code, fullName, email, phone, position, status, startDate, endDate, departmentId } = req.body;
    const userId = (req as any).user?.userId;

    const employee = await prisma.employee.update({
      where: { id: Number(id) },
      data: { 
        code, fullName, email, phone, position, status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        departmentId: Number(departmentId)
      }
    });

    await logActivity(userId, 'CẬP NHẬT NHÂN VIÊN', 'NHÂN VIÊN', { id, fullName });
    res.json(employee);
  } catch (error: any) {
    res.status(400).json({ error: 'Lỗi cập nhật thông tin nhân viên.' });
  }
};

export const transferEmployee = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { toDepartmentId, transferDate } = req.body;
    const userId = (req as any).user?.userId;

    if (!toDepartmentId || !transferDate) {
      return res.status(400).json({ error: 'Khoa chuyển đến và ngày chuyển là bắt buộc.' });
    }

    const employeeId = Number(id);
    const newDeptId = Number(toDepartmentId);
    const date = new Date(transferDate);

    await prisma.$transaction(async (tx) => {
      // 1. Update existing history record (set endDate)
      const currentHistory = await tx.departmentHistory.findFirst({
        where: { employeeId, endDate: null },
        orderBy: { startDate: 'desc' }
      });

      if (currentHistory) {
        // Validation: New transfer date must be after current start date
        if (date <= currentHistory.startDate) {
          throw new Error('Ngày chuyển phải sau ngày bắt đầu tại khoa hiện tại.');
        }

        await tx.departmentHistory.update({
          where: { id: currentHistory.id },
          data: { endDate: new Date(date.getTime() - 86400000) } // End day before transfer
        });
      }

      // 2. Create new history record
      await tx.departmentHistory.create({
        data: {
          employeeId,
          departmentId: newDeptId,
          startDate: date
        }
      });

      // 3. Update employee current department
      await tx.employee.update({
        where: { id: employeeId },
        data: { departmentId: newDeptId }
      });
    });

    await logActivity(userId, 'ĐIỀU CHUYỂN NHÂN VIÊN', 'NHÂN VIÊN', { employeeId, toDepartmentId: newDeptId, transferDate });
    res.json({ message: 'Điều chuyển khoa phòng thành công' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Lỗi điều chuyển khoa phòng' });
  }
};

export const getEmployeeTransferHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const history = await prisma.departmentHistory.findMany({
      where: { employeeId: Number(id) },
      include: { department: true },
      orderBy: { startDate: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải lịch sử công tác' });
  }
};

export const updateTransfer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { historyId } = req.params;
    const { departmentId, startDate, endDate } = req.body;
    const userId = (req as any).user?.userId;

    const updated = await prisma.departmentHistory.update({
      where: { id: Number(historyId) },
      data: {
        departmentId: Number(departmentId),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      }
    });

    // If this is the active transfer (endDate is null), update the employee's main departmentId too
    if (updated.endDate === null) {
      await prisma.employee.update({
        where: { id: updated.employeeId },
        data: { departmentId: updated.departmentId }
      });
    }

    await logActivity(userId, 'CẬP NHẬT ĐIỀU CHUYỂN', 'NHÂN VIÊN', { historyId, departmentId });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Lỗi cập nhật thông tin điều chuyển' });
  }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    
    // Check constraints...
    const assignmentsCount = await prisma.assetAssignment.count({ where: { employeeId: Number(id) } });
    if (assignmentsCount > 0) return res.status(400).json({ error: `Nhân viên đang được bàn giao ${assignmentsCount} tài sản/thiết bị. Vui lòng thu hồi trước khi xoá.` });

    await prisma.$transaction([
      prisma.departmentHistory.deleteMany({ where: { employeeId: Number(id) } }),
      prisma.employee.delete({ where: { id: Number(id) } })
    ]);

    await logActivity(userId, 'XÓA NHÂN VIÊN', 'NHÂN VIÊN', { id });
    res.json({ message: 'Đã xóa nhân viên' });
  } catch (error: any) {
    res.status(400).json({ error: 'Lỗi khi xóa nhân viên.' });
  }
};
