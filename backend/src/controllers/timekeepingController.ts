import { Request, Response } from 'express';
import prisma from '../prisma';

export const getTimekeepingByDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { departmentId, date } = req.query;
    if (!date) return res.status(400).json({ error: 'Ngày là bắt buộc' });

    const [year, month, day] = (date as string).split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    let allowedDepartmentIds: number[] | null = null;
    
    if (userRole !== 'ADMIN') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { departments: true }
      });
      allowedDepartmentIds = currentUser?.departments.map((d: any) => d.id) || [];
    }

    // Filter employees who were in the department on the target date
    const employees = await prisma.employee.findMany({
      where: {
        departmentHistory: {
          some: {
            departmentId: departmentId && departmentId !== 'all' ? Number(departmentId) : (allowedDepartmentIds ? { in: allowedDepartmentIds } : undefined),
            startDate: { lte: endOfDay },
            OR: [
              { endDate: null },
              { endDate: { gte: startOfDay } }
            ]
          }
        }
      },
      include: {
        department: true,
        timekeepingRecords: {
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          include: {
            symbol: true
          }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    res.json(employees);
  } catch (error: any) {
    console.error('Timekeeping fetch error:', error);
    res.status(500).json({ error: 'Lỗi khi tải dữ liệu chấm công' });
  }
};

export const saveBatchTimekeeping = async (req: Request, res: Response): Promise<any> => {
  try {
    const { date, records } = req.body; // records: [{ employeeId, symbolId, overtimeHours }]
    
    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    }

    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day));
    
    // Check permissions dynamically
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    
    if (userRole !== 'ADMIN') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { departments: true }
      });
      
      const permissions: any = currentUser?.permissions || {};
      const allowedDepartmentIds = currentUser?.departments.map(d => d.id) || [];
      
      // 1. Check Date (must be today UNLESS user has timekeepingPast)
      if (!permissions.timekeepingPast) {
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const targetStr = new Date(date).toLocaleDateString('en-CA');
        
        if (todayStr !== targetStr) {
          return res.status(403).json({ error: 'Bạn không có quyền chấm công cho các ngày trong quá khứ/tương lai.' });
        }
      }

      // 2. Check Employee Departments on that date
      const empIds = records.map((r: any) => Number(r.employeeId));
      const employees = await prisma.employee.findMany({
        where: { 
          id: { in: empIds },
          departmentHistory: {
            some: {
              departmentId: { in: allowedDepartmentIds },
              startDate: { lte: startOfDay },
              OR: [
                { endDate: null },
                { endDate: { gte: startOfDay } }
              ]
            }
          }
        }
      });
      
      if (employees.length < empIds.length) {
        return res.status(403).json({ error: 'Bạn không có quyền chấm công cho một số nhân viên hoặc nhân viên không thuộc khoa của bạn vào ngày này.' });
      }
    }

    // Separate records into those to update/create and those to delete
    const toUpsert = records.filter((rec: any) => rec.symbolId != null);
    const toDelete = records.filter((rec: any) => rec.symbolId == null);

    const operations = [
      ...toUpsert.map((rec: any) => 
        prisma.timekeepingRecord.upsert({
          where: {
            employeeId_date: {
              employeeId: Number(rec.employeeId),
              date: startOfDay
            }
          },
          update: {
            symbolId: Number(rec.symbolId),
            overtimeHours: rec.overtimeHours ? parseFloat(rec.overtimeHours) : 0
          },
          create: {
            employeeId: Number(rec.employeeId),
            date: startOfDay,
            symbolId: Number(rec.symbolId),
            overtimeHours: rec.overtimeHours ? parseFloat(rec.overtimeHours) : 0
          }
        })
      ),
      ...toDelete.map((rec: any) => 
        prisma.timekeepingRecord.deleteMany({
          where: {
            employeeId: Number(rec.employeeId),
            date: startOfDay
          }
        })
      )
    ];

    const results = await prisma.$transaction(operations);

    res.json({ message: 'Đã lưu dữ liệu chấm công thành công', count: results.length });
  } catch (error: any) {
    console.error('Save timekeeping error:', error);
    res.status(400).json({ error: 'Lỗi khi lưu dữ liệu chấm công: ' + error.message });
  }
};

export const getTimekeepingTimeline = async (req: Request, res: Response): Promise<any> => {
  try {
    const { departmentId, year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'Năm và tháng là bắt buộc' });

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    let allowedDepartmentIds: number[] | null = null;
    if (userRole !== 'ADMIN') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { departments: true }
      });
      allowedDepartmentIds = currentUser?.departments.map((d: any) => d.id) || [];
    }

    // Employees who were in the department at ANY point during the month
    const employees = await prisma.employee.findMany({
      where: {
        departmentHistory: {
          some: {
            departmentId: departmentId && departmentId !== 'all' ? Number(departmentId) : (allowedDepartmentIds ? { in: allowedDepartmentIds } : undefined),
            startDate: { lte: endDate },
            OR: [
              { endDate: null },
              { endDate: { gte: startDate } }
            ]
          }
        }
      },
      include: {
        department: true,
        timekeepingRecords: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            symbol: true
          }
        },
        departmentHistory: {
          where: {
            departmentId: departmentId && departmentId !== 'all' ? Number(departmentId) : (allowedDepartmentIds ? { in: allowedDepartmentIds } : undefined),
          }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    const transformed = employees.map(emp => {
      const records: Record<number, string> = {};
      
      // Get the history records for this specific department view
      const histories = emp.departmentHistory;
      
      emp.timekeepingRecords.forEach(rec => {
        const recDate = new Date(rec.date);
        const day = recDate.getDate();
        
        // Check if the record date falls within ANY of the intervals the employee was in this department
        const isInDeptOnDate = histories.some(h => {
          const hStart = new Date(h.startDate);
          hStart.setHours(0, 0, 0, 0);
          const hEnd = h.endDate ? new Date(h.endDate) : null;
          if (hEnd) hEnd.setHours(23, 59, 59, 999);
          
          return recDate >= hStart && (!hEnd || recDate <= hEnd);
        });

        if (isInDeptOnDate) {
          records[day] = (rec as any).symbol?.code || '';
        }
      });
      
      return {
        id: emp.id,
        fullName: emp.fullName,
        department: emp.department?.name || 'Chưa rõ',
        records
      };
    });

    res.json(transformed);
  } catch (error: any) {
    console.error('Timeline error:', error);
    res.status(500).json({ error: 'Lỗi khi tải dữ liệu timeline' });
  }
};

export const getTimekeepingStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const { departmentId, date } = req.query;
    if (!date) return res.status(400).json({ error: 'Ngày là bắt buộc' });

    const [year, month, day] = (date as string).split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    let allowedDepartmentIds: number[] | null = null;
    if (userRole !== 'ADMIN') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { departments: true }
      });
      allowedDepartmentIds = currentUser?.departments.map((d: any) => d.id) || [];
    }

    // 1. Total Employees on that date
    const totalEmployees = await prisma.employee.count({
      where: {
        departmentHistory: {
          some: {
            departmentId: departmentId && departmentId !== 'all' ? Number(departmentId) : (allowedDepartmentIds ? { in: allowedDepartmentIds } : undefined),
            startDate: { lte: endOfDay },
            OR: [
              { endDate: null },
              { endDate: { gte: startOfDay } }
            ]
          }
        }
      }
    });

    // 2. Records for the requested date
    const allRecords = await prisma.timekeepingRecord.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        employee: {
          departmentHistory: {
            some: {
              departmentId: departmentId && departmentId !== 'all' ? Number(departmentId) : (allowedDepartmentIds ? { in: allowedDepartmentIds } : undefined),
              startDate: { lte: endOfDay },
              OR: [
                { endDate: null },
                { endDate: { gte: startOfDay } }
              ]
            }
          }
        }
      },
      include: {
        symbol: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Deduplicate: only take the latest record for each employee
    const uniqueRecordsMap = new Map<number, any>();
    allRecords.forEach(record => {
      if (!uniqueRecordsMap.has(record.employeeId)) {
        uniqueRecordsMap.set(record.employeeId, record);
      }
    });
    const records = Array.from(uniqueRecordsMap.values());

    // 3. Status Breakdown
    const breakdownMap: Record<string, number> = {};
    records.forEach(r => {
      const label = r.symbol.name;
      breakdownMap[label] = (breakdownMap[label] || 0) + 1;
    });

    const clockedCount = records.length;
    const notClockedCount = Math.max(0, totalEmployees - clockedCount);

    // 4. Overtime Stats
    const overtimeRecords = records.filter(r => (r.overtimeHours || 0) > 0);
    const overtimePeopleCount = overtimeRecords.length;
    const totalOvertimeHours = overtimeRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

    res.json({
      totalEmployees,
      clockedCount,
      notClockedCount,
      overtimePeopleCount,
      totalOvertimeHours,
      breakdown: Object.entries(breakdownMap).map(([name, value]) => ({ name, value }))
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Lỗi khi tải thống kê chấm công' });
  }
};


export const getPreviousDayTimekeeping = async (req: Request, res: Response): Promise<any> => {
  try {
    const { departmentId, date } = req.query;
    if (!date) return res.status(400).json({ error: 'Ngày hiện tại là bắt buộc' });

    const [year, month, day] = (date as string).split('-').map(Number);
    const startOfTargetDay = new Date(year, month - 1, day, 0, 0, 0, 0);

    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    let allowedDepartmentIds: number[] | null = null;
    
    if (userRole !== 'ADMIN') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { departments: true }
      });
      allowedDepartmentIds = currentUser?.departments.map((d: any) => d.id) || [];
    }

    const deptId = departmentId && departmentId !== 'all' ? Number(departmentId) : (allowedDepartmentIds && allowedDepartmentIds.length > 0 ? { in: allowedDepartmentIds } : undefined);

    // 1. Calculate the actual previous day
    const prevDate = new Date(startOfTargetDay);
    prevDate.setDate(prevDate.getDate() - 1);
    
    const startOfPrevDay = new Date(Date.UTC(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate()));
    const endOfPrevDay = new Date(Date.UTC(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate(), 23, 59, 59, 999));

    // 2. Fetch those records
    const records = await prisma.timekeepingRecord.findMany({
      where: {
        date: { gte: startOfPrevDay, lte: endOfPrevDay },
        employee: {
          departmentHistory: {
            some: {
              departmentId: deptId as any
            }
          }
        }
      },
      include: {
        symbol: true
      }
    });

    res.json({ 
      date: prevDate, 
      records: records.map(r => ({
        employeeId: r.employeeId,
        symbolId: r.symbolId,
        overtimeHours: r.overtimeHours
      }))
    });
  } catch (error: any) {
    console.error('Previous day fetch error:', error);
    res.status(500).json({ error: 'Lỗi khi tải dữ liệu ngày trước' });
  }
};
