import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prisma';
import { logActivity } from '../utils/logger';
import * as ExcelJS from 'exceljs';

export const getAssets = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;

    let departmentFilter: any = undefined;

    if (userRole?.toUpperCase() !== 'ADMIN') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { departments: true }
      });
      const userDepartmentIds = currentUser?.departments.map((d: any) => d.id) || [];
      departmentFilter = {
        departmentId: { in: userDepartmentIds }
      };
    }

    const assets = await prisma.asset.findMany({
      where: departmentFilter,
      include: {
        equipmentType: true,
        department: true,
        supplier: true,
        statusConfig: true,
        liquidation: true,
        maintenances: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssetById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({
      where: { id: Number(id) },
      include: {
        equipmentType: true,
        department: true,
        supplier: true,
        statusConfig: true,
        histories: {
          include: { performedBy: true },
          orderBy: { date: 'desc' }
        },
        assignments: {
          include: { employee: true },
          where: { status: 'ACTIVE' }
        }
      }
    });
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAsset = async (req: any, res: Response) => {
  try {
    const { 
      assetCode, name, description, equipmentTypeId, supplierId, departmentId, 
      purchasePrice, model, serialNumber, manufacturer, purchaseDate, 
      requiresCalibration, calibrationCycle, unit, group,
      symbol, origin, manufactureYear, machineCode, registrationNumber, manualLink
    } = req.body;
    
    const qrCode = `HAMS-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    const asset = await prisma.asset.create({
      data: {
        assetCode,
        name,
        description,
        equipmentTypeId: Number(equipmentTypeId),
        supplierId: supplierId ? Number(supplierId) : null,
        departmentId: departmentId ? Number(departmentId) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        model,
        serialNumber,
        manufacturer,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        requiresCalibration: requiresCalibration === true || requiresCalibration === 'true',
        calibrationCycle: calibrationCycle ? Number(calibrationCycle) : null,
        unit: unit || 'Cái',
        qrCode,
        statusId: 0,
        symbol,
        origin,
        manufactureYear,
        machineCode,
        registrationNumber,
        manualLink,
        group: group || null
      } as any
    });

    const userId = (req as any).user?.userId;
    await logActivity(userId, 'THÊM TÀI SẢN', 'TÀI SẢN', { id: asset.id, assetCode: asset.assetCode, name: asset.name });

    const currEmployee = await prisma.employee.findUnique({
      where: { userId: (req as any).user.userId }
    });

    if (currEmployee) {
      await prisma.assetHistory.create({
        data: {
          assetId: asset.id,
          actionType: 'CREATE',
          description: 'Hệ thống: Tạo mới tài sản',
          performedById: currEmployee.id
        }
      });
    }

    res.status(201).json(asset);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAsset = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { 
      name, description, equipmentTypeId, supplierId, departmentId, purchasePrice, 
      statusId, unit, group, model, serialNumber, manufacturer, purchaseDate, 
      requiresCalibration, calibrationCycle,
      symbol, origin, manufactureYear, machineCode, registrationNumber, manualLink
    } = req.body;
    
    const asset = await prisma.asset.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        equipmentTypeId: equipmentTypeId ? Number(equipmentTypeId) : undefined,
        supplierId: supplierId ? Number(supplierId) : null,
        departmentId: departmentId ? Number(departmentId) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        model,
        serialNumber,
        manufacturer,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        requiresCalibration: requiresCalibration === true || requiresCalibration === 'true',
        calibrationCycle: calibrationCycle ? Number(calibrationCycle) : null,
        unit,
        statusId: statusId !== undefined ? Number(statusId) : undefined,
        symbol,
        origin,
        manufactureYear,
        machineCode,
        registrationNumber,
        manualLink,
        group: group !== undefined ? group : undefined
      } as any
    });

    const userId = (req as any).user?.userId;
    await logActivity(userId, 'CẬP NHẬT TÀI SẢN', 'TÀI SẢN', { id: asset.id, assetCode: asset.assetCode });

    const currEmployee = await prisma.employee.findUnique({
      where: { userId: (req as any).user.userId }
    });

    if (currEmployee) {
      await prisma.assetHistory.create({
        data: {
          assetId: asset.id,
          actionType: 'UPDATE',
          description: 'Hệ thống: Cập nhật thông tin tài sản',
          performedById: currEmployee.id
        }
      });
    }

    res.json(asset);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAsset = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction([
      prisma.assetHistory.deleteMany({ where: { assetId: Number(id) } }),
      prisma.assetAssignment.deleteMany({ where: { assetId: Number(id) } }),
      prisma.maintenanceRecord.deleteMany({ where: { assetId: Number(id) } }),
      prisma.supportTicket.deleteMany({ where: { assetId: Number(id) } }),
      prisma.asset.delete({ where: { id: Number(id) } })
    ]);

    const userId = (req as any).user?.userId;
    await logActivity(userId, 'XÓA TÀI SẢN', 'TÀI SẢN', { id: Number(id) });

    res.json({ message: 'Asset deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: 'Cannot delete asset. Cascading failure.' });
  }
};

export const reportBreakdown = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const userId = (req as any).user?.userId;

    const asset = await prisma.asset.findUnique({ where: { id: Number(id) } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const employee = await prisma.employee.findUnique({ where: { userId } });

    // 1. Update asset status
    await prisma.asset.update({
      where: { id: Number(id) },
      data: { statusId: 1 } // BROKEN -> 1
    });

    let performerId = employee?.id;
    if (!performerId) {
      const fallbackEmp = await prisma.employee.findFirst();
      performerId = fallbackEmp?.id;
    }

    // 2. Create History
    if (performerId) {
      await prisma.assetHistory.create({
        data: {
          assetId: Number(id),
          actionType: 'BREAKDOWN',
          description: `Báo hỏng: ${description}`,
          performedById: performerId
        }
      });
    }

    // 3. Create Maintenance Record (PENDING)
    const maintenanceCode = `SC-AUTO-${Date.now().toString().slice(-6)}`;
    await prisma.maintenanceRecord.create({
      data: {
        code: maintenanceCode,
        name: `Sửa chữa thiết bị ${asset.assetCode} - ${asset.name}`,
        assetId: Number(id),
        description: description,
        startDate: new Date(),
        status: 'PENDING',
        creatorId: employee?.id || null
      }
    });

    await logActivity(userId, 'BÁO HỎNG THIẾT BỊ', 'TÀI SẢN', { id: Number(id), description });

    res.json({ message: 'Báo hỏng thành công', maintenanceCode });
  } catch (error: any) {
    console.error('Breakdown Report Error:', error);
    res.status(500).json({ error: 'Lỗi khi báo hỏng thiết bị' });
  }
};

export const transferAsset = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { departmentId, receiveDate, receiverId } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id: Number(id) } });
    if (!asset) return res.status(404).json({ error: 'Không tìm thấy tài sản' });

    const userId = (req as any).user?.userId;
    const employee = await prisma.employee.findUnique({ where: { userId } });

    const dept = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
    const receiver = receiverId ? await prisma.employee.findUnique({ where: { id: Number(receiverId) } }) : null;

    if (!dept) return res.status(400).json({ error: 'Khoa phòng không hợp lệ' });

    // Restriction: Broken (1) or Stopped (2) assets can ONLY be moved by Admin, 
    // or to "Khoa Dược - vật tư y tế" by others.
    const userRole = (req as any).user?.role?.toUpperCase();
    if (asset.statusId === 1 || asset.statusId === 2) {
      const isTargetDeptVatTu = dept.name.toLowerCase().includes('dược') || dept.name.toLowerCase().includes('vật tư');
      if (userRole !== 'ADMIN' && !isTargetDeptVatTu) {
        return res.status(403).json({ error: 'Chỉ Admin mới được luân chuyển thiết bị hỏng sang các khoa phòng khác.' });
      }
    }

    const dateStr = receiveDate ? new Date(receiveDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN');
    
    let performerId = employee?.id;
    if (!performerId) {
      const fallbackEmp = await prisma.employee.findFirst();
      performerId = fallbackEmp?.id;
    }

    await prisma.$transaction(async (tx) => {
      await tx.asset.update({
        where: { id: Number(id) },
        data: { departmentId: Number(departmentId) }
      });
      if (performerId) {
        await tx.assetHistory.create({
          data: {
            assetId: Number(id),
            actionType: 'TRANSFER',
            description: `Luân chuyển sang: ${dept.name}. ${receiver ? 'Người nhận: ' + receiver.fullName + '.' : ''} Ngày nhận: ${dateStr}`,
            performedById: performerId
          }
        });
      }
    });

    await logActivity(userId, 'LUÂN CHUYỂN TÀI SẢN', 'TÀI SẢN', { id: Number(id), departmentId: Number(departmentId) });

    res.json({ message: 'Luân chuyển tài sản thành công' });
  } catch (error: any) {
    console.error('Transfer Error:', error);
    res.status(500).json({ error: 'Lỗi khi luân chuyển tài sản' });
  }
};

export const liquidateAsset = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason, date } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id: Number(id) } });
    if (!asset) return res.status(404).json({ error: 'Không tìm thấy tài sản' });

    if (asset.statusId !== 1 && asset.statusId !== 2) {
      return res.status(400).json({ error: 'Tài sản không ở trạng thái hợp lệ để thanh lý' });
    }

    const userId = (req as any).user?.userId;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    
    let performerId = employee?.id;
    if (!performerId) {
      const fallbackEmp = await prisma.employee.findFirst();
      performerId = fallbackEmp?.id;
    }

    const liquidationDate = date ? new Date(date) : new Date();

    await prisma.$transaction(async (tx) => {
      await tx.liquidationRecord.create({
        data: {
          assetId: Number(id),
          reason: reason || 'Chưa nêu lý do',
          date: liquidationDate,
          creatorId: performerId
        }
      });
      
      await tx.asset.update({
        where: { id: Number(id) },
        data: { statusId: 2 } // RETIRED -> 2
      });

      if (performerId) {
        await tx.assetHistory.create({
          data: {
            assetId: Number(id),
            actionType: 'LIQUIDATE_START',
            description: `Đưa vào danh sách chờ thanh lý. Lý do: ${reason}`,
            performedById: performerId
          }
        });
      }
    });

    await logActivity(userId, 'ĐƯA VÀO THANH LÝ', 'TÀI SẢN', { id: Number(id), reason });

    res.json({ message: 'Đưa tài sản vào danh sách thanh lý thành công' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Tài sản này đã nằm trong danh sách thanh lý' });
    }
    console.error('Liquidation Error:', error);
    res.status(500).json({ error: 'Lỗi server khi thanh lý tài sản' });
  }
};

export const exportAssets = async (req: Request, res: Response) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        equipmentType: true,
        department: true,
        supplier: true,
        statusConfig: true,
        histories: { include: { performedBy: true }, orderBy: { date: 'desc' } },
        maintenances: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { assetCode: 'asc' }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Danh sách tài sản');

    // Headers
    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Mã Tài sản', key: 'assetCode', width: 15 },
      { header: 'Tên Tài sản', key: 'name', width: 30 },
      { header: 'Nhóm', key: 'group', width: 15 },
      { header: 'Loại', key: 'type', width: 20 },
      { header: 'Khoa/Phòng', key: 'dept', width: 25 },
      { header: 'Tình trạng', key: 'status', width: 15 },
      { header: 'Model', key: 'model', width: 15 },
      { header: 'Serial', key: 'serial', width: 15 },
      { header: 'Ngày mua', key: 'purchaseDate', width: 12 },
      { header: 'Nguyên giá', key: 'price', width: 15 },
      { header: 'Lịch sử Biến động / Sửa chữa', key: 'history', width: 100 }
    ];

    // Styling headers
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    assets.forEach((asset: any, index) => {
      const historySummary = (asset.histories || []).map((h: any) => 
        `[${new Date(h.date).toLocaleDateString('vi-VN')}] ${h.actionType}: ${h.description} (${h.performedBy?.fullName || 'N/A'})`
      ).join('\n');

      const maintenanceSummary = (asset.maintenances || []).map((m: any) =>
        `[Sửa chữa ${new Date(m.createdAt).toLocaleDateString('vi-VN')}] ${m.name} - Trạng thái: ${m.status}`
      ).join('\n');

      sheet.addRow({
        stt: index + 1,
        assetCode: asset.assetCode,
        name: asset.name,
        group: asset.group || 'Chưa nhóm',
        type: asset.equipmentType?.name || '',
        dept: asset.department?.name || '',
        status: asset.statusConfig?.tentt || '',
        model: asset.model || '',
        serial: asset.serialNumber || '',
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('vi-VN') : '',
        price: asset.purchasePrice ? asset.purchasePrice.toLocaleString('vi-VN') : '0',
        history: (historySummary + (maintenanceSummary ? '\n---\n' + maintenanceSummary : '')).trim()
      });
    });

    // Alignment
    sheet.getColumn('history').alignment = { wrapText: true, vertical: 'top' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Danh_sach_tai_san.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Lỗi xuất file Excel' });
  }
};

export const getImportTemplate = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Template');

    if (type === 'assets') {
      sheet.columns = [
        { header: 'Mã tài sản (Để trống tự sinh)', key: 'assetCode', width: 25 },
        { header: 'Tên tài sản (*)', key: 'name', width: 30 },
        { header: 'Nhóm thiết bị (Y tế/CNTT/Hành chính)', key: 'group', width: 25 },
        { header: 'Loại thiết bị (ID)', key: 'typeId', width: 15 },
        { header: 'Khoa phòng (ID)', key: 'deptId', width: 15 },
        { header: 'Nhà cung cấp (ID)', key: 'supplierId', width: 15 },
        { header: 'Đơn vị tính', key: 'unit', width: 15 },
        { header: 'Nguyên giá', key: 'price', width: 15 },
        { header: 'Model', key: 'model', width: 15 },
        { header: 'Số Serial', key: 'serial', width: 15 },
        { header: 'Hãng sản xuất', key: 'manufacturer', width: 20 },
        { header: 'Ngày mua (YYYY-MM-DD)', key: 'date', width: 20 },
        { header: 'Mô tả', key: 'description', width: 30 },
        { header: 'Ký hiệu', key: 'symbol', width: 15 },
        { header: 'Nguồn gốc', key: 'origin', width: 15 },
        { header: 'Năm sản xuất', key: 'manufactureYear', width: 15 },
        { header: 'Mã máy', key: 'machineCode', width: 15 },
        { header: 'Số lưu hành', key: 'registrationNumber', width: 15 },
        { header: 'Link HDSD', key: 'manualLink', width: 20 },
        { header: 'Chu kỳ kiểm định (tháng)', key: 'calibrationCycle', width: 20 },
        { header: 'Yêu cầu kiểm định (Có/Không)', key: 'requiresCalibration', width: 20 }
      ];
      // Sample row
      sheet.addRow({ 
        assetCode: '', 
        name: 'Máy siêu âm chuyên dụng', 
        group: 'Thiết bị y tế', 
        unit: 'Cái', 
        price: 150000000, 
        date: '2024-01-01',
        requiresCalibration: 'Có',
        calibrationCycle: 12
      });
    } else if (type === 'employees') {
      sheet.columns = [
        { header: 'Mã nhân viên (*)', key: 'code', width: 15 },
        { header: 'Họ và tên (*)', key: 'fullName', width: 25 },
        { header: 'Chức danh', key: 'position', width: 15 },
        { header: 'Khoa phòng (ID)', key: 'deptId', width: 15 },
        { header: 'Số điện thoại', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 20 }
      ];
      sheet.addRow({ code: 'NV001', fullName: 'Nguyễn Văn A', position: 'Bác sĩ' });
    } else {
      return res.status(400).json({ error: 'Loại template không hợp lệ' });
    }

    sheet.getRow(1).font = { bold: true };
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Template_${type}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải template' });
  }
};
