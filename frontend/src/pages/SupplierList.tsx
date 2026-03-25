import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Search, Building2, Trash2, Edit, FileSpreadsheet } from 'lucide-react';
import { SupplierFormModal } from '../components/SupplierFormModal';
import { SupplierExcelImportModal } from '../components/SupplierExcelImportModal';

interface Supplier {
  id: number;
  code: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: string;
}

export const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data } = await apiClient.get('/suppliers');
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('CẢNH BÁO: Xoá Nhà Cung Cấp?\nNếu NCC này đang được sử dụng ở một Tài sản, hệ thống sẽ chặn thao tác.')) {
      try {
        await apiClient.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Lỗi hệ thống khi xoá');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      case 'INACTIVE': return 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Đối tác & NCC</h1>
          <p className="text-gray-500 mt-2 font-medium">Danh bạ các Đối tác, Nhà cung cấp vật tư y tế trong hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsImportOpen(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            <FileSpreadsheet size={20} /> Excel Upload
          </button>
          <button onClick={() => { setSupplierToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus size={20} /> Tạo Mới
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã, tên công ty..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="p-5 font-bold uppercase tracking-wider text-[10px] text-center w-12">STT</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Mã Công Ty</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Tên Nhà Cung Cấp</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">SĐT Liên Hệ</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Trạng thái</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-right">Điều khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center font-bold text-gray-400">Đang đồng bộ danh bạ từ máy chủ...</td></tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500 font-medium z-10">Bạn chưa đăng ký bất kỳ NCC nào vào hệ thống HAMS.</td></tr>
              ) : (
                filteredSuppliers.map((supplier, index) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                    <td className="p-5 text-center font-bold text-gray-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="p-5 font-mono text-sm font-bold text-gray-500 dark:text-gray-400">
                      {supplier.code || '---'}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 border border-gray-200/50 dark:border-gray-700/50 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition shadow-sm">
                          <Building2 size={20} />
                        </div>
                        <span className="font-extrabold text-gray-900 dark:text-white text-[15px] group-hover:text-blue-500 transition">{supplier.name}</span>
                      </div>
                    </td>
                    <td className="p-5 font-semibold text-gray-600 dark:text-gray-300">{supplier.phone || '---'}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-[0.4rem] text-[11px] font-extrabold tracking-widest uppercase shadow-sm ${getStatusColor(supplier.status || 'ACTIVE')}`}>
                        {(supplier.status || 'ACTIVE').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-5 text-right flex items-center justify-end gap-1">
                      <button onClick={() => { setSupplierToEdit(supplier); setIsFormOpen(true); }} className="p-2.5 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/20 hover:shadow-sm transition" title="Chỉnh sửa Chi tiết">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(supplier.id)} className="p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 hover:shadow-sm transition" title="Xóa Đối tác">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupplierFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSaved={fetchSuppliers} 
        supplierToEdit={supplierToEdit} 
      />
      <SupplierExcelImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onImported={fetchSuppliers} 
      />
    </div>
  );
};
