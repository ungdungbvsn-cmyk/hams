import { useState } from 'react';
import { X, UploadCloud, Building2 } from 'lucide-react';
import * as xlsx from 'xlsx';
import apiClient from '../api/client';

export const SupplierExcelImportModal = ({ isOpen, onClose, onImported }: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

        const payload = data.map((row: any) => ({
          code: row['Mã nhà cung cấp'] || row.code || '',
          name: row['Tên nhà cung cấp'] || row.name || '',
          phone: row['Điện thoại'] || row.phone || '',
          status: row['Trạng thái'] || row.status || 'ACTIVE',
        }));

        for (const item of payload) {
          if (item.name) {
             try { await apiClient.post('/suppliers', item); } catch(ex) {}
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 relative shadow-2xl text-center">
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 rounded-full transition"><X size={20}/></button>
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20"><Building2 size={36}/></div>
        <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-2">Nhập Hàng Loạt NCC</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">Vui lòng chọn file chứa các cột: `Mã nhà cung cấp`, `Tên nhà cung cấp`, `Điện thoại`.</p>
        
        {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl mb-4 text-sm font-bold uppercase tracking-wider">{error}</div>}

        <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <UploadCloud size={40} className="text-blue-500 mb-3" />
          <span className="font-bold text-gray-700 dark:text-gray-300">{loading ? 'Đang Import Hệ Thống...' : 'Tải lên bảng tính (.xlsx)'}</span>
          <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={loading} />
        </label>
      </div>
    </div>
  );
};
