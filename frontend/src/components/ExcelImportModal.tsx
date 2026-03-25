import { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet } from 'lucide-react';
import * as xlsx from 'xlsx';
import apiClient from '../api/client';

export const ExcelImportModal = ({ isOpen, onClose, onImported }: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const downloadAssetTemplate = async () => {
    try {
      const response = await apiClient.get('/assets/import-template/assets', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Tai_San.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Lỗi tải template. Vui lòng thử lại.');
    }
  };


  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (evt: any) => {
      try {
        const bstr = evt.target.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Map Departments, Types, Suppliers
        const [depRes, typeRes, supplierRes, assetRes] = await Promise.all([
          apiClient.get('/departments'),
          apiClient.get('/equipment-types'),
          apiClient.get('/suppliers'),
          apiClient.get('/assets')
        ]);
        const departments = depRes.data;
        const equipmentTypes = typeRes.data;
        const suppliers = supplierRes.data;
        let currentCount = assetRes.data.length + 1;

        const data = xlsx.utils.sheet_to_json(ws);

        for (const row of data as any[]) {
          let assetCode = row['Mã tài sản (Để trống tự sinh)'] || row['Mã tài sản'] || row.assetCode || '';
          if (!assetCode) {
            assetCode = `TS${String(currentCount).padStart(5, '0')}`;
            currentCount++;
          }

          const name = row['Tên thiết bị'] || row['Tên tài sản (*)'] || row.name || '';
          if (!name) continue; 

          // Match department
          let departmentId = null;
          const deptVal = row['Khoa phòng'] || row['Khoa phòng (ID)'] || row['deptId'];
          if (deptVal) {
            const deptMatch = departments.find((d: any) => 
              d.id === Number(deptVal) || 
              d.name.toLowerCase().trim() === String(deptVal).toLowerCase().trim()
            );
            if (deptMatch) departmentId = deptMatch.id;
          }

          // Match equipment type
          let equipmentTypeId = equipmentTypes[0]?.id || 1;
          const typeVal = row['Loại thiết bị'] || row['Loại thiết bị (ID)'] || row['typeId'];
          if (typeVal) {
            const typeMatch = equipmentTypes.find((t: any) => 
              t.id === Number(typeVal) || 
              t.name.toLowerCase().trim() === String(typeVal).toLowerCase().trim()
            );
            if (typeMatch) equipmentTypeId = typeMatch.id;
          }

          // Match Supplier
          let supplierId = null;
          const supplierVal = row['Nhà cung cấp'] || row['Nhà cung cấp (ID)'] || row['supplierId'];
          if (supplierVal) {
            const supplierMatch = suppliers.find((s: any) => 
              s.id === Number(supplierVal) || 
              s.name.toLowerCase().trim() === String(supplierVal).toLowerCase().trim()
            );
            if (supplierMatch) supplierId = supplierMatch.id;
          }

          // Match status
          let statusId = 0;
          const statusVal = String(row['Tình trạng'] || row['Trạng thái'] || row.status || '').toLowerCase();
          if (statusVal.includes('hỏng')) statusId = 1;
          else if (statusVal.includes('thanh lý') || statusVal.includes('ngừng')) statusId = 2;
          else if (statusVal.includes('sửa chữa') || statusVal.includes('bảo trì')) statusId = 4;
          else if (statusVal.includes('kiểm định')) statusId = 5;
          else if (statusVal.includes('mượn')) statusId = 6;

          const item = {
            assetCode,
            name,
            equipmentTypeId,
            departmentId,
            supplierId,
            statusId,
            unit: row['Đơn vị tính'] || row['unit'] || 'Cái',
            group: row['Nhóm thiết bị (Y tế/CNTT/Hành chính)'] || row['Nhóm thiết bị'] || row['group'] || null,
            model: row['Model'] || row['model'] || '',
            serialNumber: row['Số Serial'] || row['serial'] || '',
            manufacturer: row['Hãng sản xuất'] || row['manufacturer'] || '',
            purchaseDate: row['Ngày mua (YYYY-MM-DD)'] || row['Ngày mua'] || row['date'] || null,
            description: row['Mô tả'] || row['description'] || '',
            purchasePrice: parseFloat(row['Nguyên giá']) || row['price'] || 0,
            symbol: row['Ký hiệu'] || row['symbol'] || '',
            origin: row['Nguồn gốc / xuất xứ'] || row['Nguồn gốc'] || row['origin'] || '',
            manufactureYear: String(row['Năm sản xuất'] || row['manufactureYear'] || ''),
            machineCode: row['Mã máy'] || row['machineCode'] || '',
            registrationNumber: row['Số lưu hành'] || row['registrationNumber'] || '',
            manualLink: row['Link HDSD / Tài liệu'] || row['Link HDSD'] || row['manualLink'] || '',
            calibrationCycle: parseInt(row['Chu kỳ kiểm định (tháng)']) || row['calibrationCycle'] || null,
            requiresCalibration: String(row['Yêu cầu kiểm định (Có/Không)'] || '').toLowerCase() === 'có' || row['requiresCalibration'] === true,
            qrCode: `asset-${Date.now()}-${Math.floor(Math.random()*1000)}` 
          };

          try { await apiClient.post('/assets', item); } catch(ex) { console.error('Import err', ex); }
        }

        onImported();
        onClose();
      } catch (err: any) {
        setError('Lỗi phân tích hoặc gửi dữ liệu. Có thể mã tài sản đã bị trùng lặp trong hệ thống.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative border border-white/10 text-center">
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-gray-100/50 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:bg-gray-700/50 dark:hover:bg-red-500/20 rounded-full transition-all active:scale-95">
          <X size={20} />
        </button>
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
          <FileSpreadsheet size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Nhập Dữ liệu Excel</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">
          Tải file template bên dưới, nhập đầy đủ thông tin thiết bị <br/>
          (Mã, Tên, Loại, Khoa phòng, Tình trạng, Nhà cung cấp, Nhóm thiết bị, Model, Serial, Ngày mua...) <br/>
          sau đó tải lên để cập nhật vào hệ thống.
        </p>

        <div className="flex justify-center mb-6">
          <button onClick={downloadAssetTemplate} className="px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition flex items-center gap-2">
            <FileSpreadsheet size={18} /> Template mẫu
          </button>
        </div>

        {error && <div className="p-4 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 rounded-xl text-sm font-bold mb-6 flex uppercase tracking-wide gap-2 text-left">{error}</div>}

        <label className={`w-full flex flex-col items-center px-4 py-8 bg-gray-50 dark:bg-gray-900/50 text-blue-500 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-500 transition-all cursor-pointer shadow-sm ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <UploadCloud size={40} className="mb-3 text-blue-500" />
          <span className="font-extrabold text-gray-700 dark:text-gray-300 text-lg">
            {loading ? 'Hệ thống Đang xử lý...' : 'Chọn file Máy tính (.xlsx, .xls)'}
          </span>
          <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={loading} />
        </label>
      </div>
    </div>
  );
};
