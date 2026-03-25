import { useState, useEffect } from 'react';
import { X, UploadCloud, Users } from 'lucide-react';
import * as xlsx from 'xlsx';
import apiClient from '../api/client';

export const EmployeeExcelImportModal = ({ isOpen, onClose, onImported }: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/departments').then(res => setDepartments(res.data)).catch();
    }
  }, [isOpen]);

  const downloadSample = () => {
    const ws = xlsx.utils.aoa_to_sheet([
      ['Mã nhân viên', 'Họ và tên', 'Chức vụ', 'Khoa phòng quản lý', 'Trạng thái'],
      ['', 'Nguyễn Văn A', 'Trưởng khoa', 'Khám bệnh', 'ACTIVE'],
      ['', 'Trần Thị B', 'Nhân viên', 'Nhi', 'ACTIVE']
    ]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Nhan_Vien');
    xlsx.writeFile(wb, 'Mau_Nhap_Nhan_Vien.xlsx');
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
        const data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        // Prepare auto-code generation
        const empRes = await apiClient.get('/employees');
        let currentCount = empRes.data.length + 1;

        for (const row of data as any[]) {
          // Lấy mã phòng ban
          let deptId = departments[0]?.id || 1; 
          const deptNameInput = row['Khoa phòng'] || row['Phòng ban'] || row['Khoa phòng quản lý'];
          if (deptNameInput) {
            const matches = departments.find(d => d.name.toLowerCase().includes(deptNameInput.toLowerCase()));
            if (matches) deptId = matches.id;
          }

          let code = row['Mã nhân viên'] || row.code || '';
          if (!code) {
             code = `NV${String(currentCount).padStart(4, '0')}`;
             currentCount++;
          }

          const fullName = row['Họ và tên'] || row['Tên nhân viên'] || row.name || '';
          if (!fullName) continue;

          const item = {
            code,
            fullName,
            email: `emp${code}@hams.com`, // fake email as placeholder
            phone: '',
            position: row['Chức vụ'] || row.position || 'Nhân viên',
            status: row['Trạng thái'] === 'Khóa' || row['Trạng thái'] === 'Khoá' || row['Trạng thái'] === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            departmentId: deptId,
            startDate: row['Từ ngày'] ? convertExcelDate(row['Từ ngày']) : null,
            endDate: row['Đến ngày'] ? convertExcelDate(row['Đến ngày']) : null,
          };

          if (item.fullName && item.departmentId) {
             try { await apiClient.post('/employees', item); } catch(ex) { console.error('Import err', ex); }
          }
        }

        onImported();
        onClose();
      } catch (err: any) {
        setError('Lọc file thất bại. Kiểm tra lại định dạng chuẩn của file Excel.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const convertExcelDate = (excelDate: any) => {
    if (typeof excelDate === 'number') {
        const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
        return date.toISOString();
    }
    return new Date(excelDate).toISOString();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 relative shadow-2xl text-center">
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 rounded-full transition"><X size={20}/></button>
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20"><Users size={36}/></div>
        <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 mb-2">Nhập Excel Nhân Sự</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
          Cột yêu cầu: <code className="bg-gray-100 rounded px-1">Mã nhân viên</code> (nếu để trống tự sinh NV000x), <code className="bg-gray-100 rounded px-1">Họ và tên</code>, <code className="bg-gray-100 rounded px-1">Chức vụ</code>, <code className="bg-gray-100 rounded px-1">Khoa phòng quản lý</code>, <code className="bg-gray-100 rounded px-1">Trạng thái</code>.
        </p>

        <button onClick={downloadSample} className="mb-6 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition">
          ⬇ Tải File Excel Mẫu
        </button>
        
        {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl mb-4 text-sm font-bold tracking-wider">{error}</div>}

        <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <UploadCloud size={40} className="text-blue-500 mb-3" />
          <span className="font-bold text-gray-700 dark:text-gray-300">{loading ? 'Đang Import Hệ Thống...' : 'Tải lên bảng tính (.xlsx)'}</span>
          <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={loading} />
        </label>
      </div>
    </div>
  );
};
