import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Search, Clock, Trash2, Edit } from 'lucide-react';
import { TimekeepingSymbolFormModal } from '../components/TimekeepingSymbolFormModal';

interface Symbol {
  id: number;
  code: string;
  name: string;
}

export const TimekeepingSymbolList = () => {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [symbolToEdit, setSymbolToEdit] = useState<Symbol | null>(null);

  useEffect(() => {
    fetchSymbols();
  }, []);

  const fetchSymbols = async () => {
    try {
      const { data } = await apiClient.get('/timekeeping-symbols');
      setSymbols(data);
    } catch (error) {
      console.error('Failed to fetch symbols');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Cảnh báo: Bạn có chắc chắn muốn xoá ký hiệu chấm công này?')) {
      try {
        await apiClient.delete(`/timekeeping-symbols/${id}`);
        fetchSymbols();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Lỗi hệ thống khi xoá');
      }
    }
  };

  const filteredSymbols = symbols.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex items-center gap-3">
          <Clock className="text-primary" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ký hiệu Chấm công</h1>
            <p className="text-gray-500 text-sm mt-0.5">Quản lý danh mục các quy định và ký hiệu chấm công</p>
          </div>
        </div>
        <button onClick={() => { setSymbolToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition">
          <Plus size={18} /> Thêm Ký hiệu
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã, tên ký hiệu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs font-semibold border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 text-center w-12 text-xs">STT</th>
                <th className="py-4 px-6 w-32">Mã Ký Hiệu</th>
                <th className="py-4 px-6">Tên Ký Hiệu / Quy định</th>
                <th className="py-4 px-6 w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={4} className="py-10 text-center font-medium text-gray-500">Đang tải danh mục...</td></tr>
              ) : filteredSymbols.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center font-medium text-gray-500">Không tìm thấy Ký hiệu chấm công nào.</td></tr>
              ) : filteredSymbols.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition group">
                  <td className="py-4 px-6 text-center font-bold text-gray-400 text-xs">{index + 1}</td>
                  <td className="py-4 px-6 font-mono font-bold text-gray-600 dark:text-gray-300">{item.code}</td>
                  <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                  <td className="py-4 px-6 text-right flex items-center justify-end gap-1">
                    <button onClick={() => { setSymbolToEdit(item); setIsFormOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition" title="Sửa">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition" title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TimekeepingSymbolFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={fetchSymbols} symbolToEdit={symbolToEdit} />
    </div>
  );
};
