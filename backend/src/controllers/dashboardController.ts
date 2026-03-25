import { Request, Response } from 'express';
import prisma from '../prisma';

export const getStats = async (req: Request, res: Response) => {
  try {
    const { departmentId, equipmentTypeId } = req.query;
    
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;

    const where: any = {};
    if (departmentId && departmentId !== 'all') {
      where.departmentId = Number(departmentId);
    } else if (userRole?.toUpperCase() !== 'ADMIN') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { departments: true }
      });
      const userDepartmentIds = currentUser?.departments.map((d: any) => d.id) || [];
      where.departmentId = { in: userDepartmentIds };
    }

    if (equipmentTypeId && equipmentTypeId !== 'all') where.equipmentTypeId = Number(equipmentTypeId);

    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [total, active, broken, retired, calibrationSoon, assetsByDept, depts] = await Promise.all([
      prisma.asset.count({ where }),
      prisma.asset.count({ 
        where: { 
          ...where, 
          statusId: 0 // AVAILABLE -> 0
        } 
      }),
      prisma.asset.count({ 
        where: { 
          ...where, 
          statusId: { in: [1, 4] } // BROKEN, MAINTENANCE -> 1, 4
        } 
      }),
      prisma.asset.count({ 
        where: { 
          ...where, 
          statusId: 2 // RETIRED -> 2
        } 
      }),
      prisma.asset.count({
        where: {
          ...where,
          requiresCalibration: true,
          nextCalibrationDate: {
            lte: thirtyDaysLater
          }
        }
      }),
      prisma.asset.groupBy({
        by: ['departmentId'],
        _count: true,
        where
      }),
      prisma.department.findMany()
    ]);

    const deptMap = depts.reduce((acc: any, d: any) => ({ ...acc, [d.id]: d.name }), {});
    
    const assetsByDepartment = assetsByDept.map(a => ({
      name: a.departmentId ? deptMap[a.departmentId] : 'Chưa phân bổ',
      value: a._count
    }));

    res.json({
      total,
      active,
      broken,
      retired,
      calibrationSoon,
      assetsByDepartment
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
