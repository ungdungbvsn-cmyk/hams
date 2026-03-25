import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Search, Building, Trash2, Edit, FileSpreadsheet } from 'lucide-react';
import { DepartmentFormModal } from '../components/DepartmentFormModal';
import { DepartmentExcelImportModal } from '../components/DepartmentExcelImportModal';
import { useAuthStore } from '../store/useAuthStore';

interface Department {
  id: number;
  code: string;
  name: string;
  description: string;
}

export const DepartmentList = () => {
  const { user } = useAuthStore();
  const hasImportExcel = user?.role?.name === 'ADMIN' || (user?.permissions as any)?.importExcel;

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await apiClient.get('/departments');
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Xoá Khoa / Phòng này? Tất cả nhân viên và thiết bị nếu có liên quan sẽ báo lỗi chặn thao tác.')) {
      try {
        await apiClient.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Lỗi hệ thống khi xoá');
      }
    }
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.code && d.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Khoa Phòng</h1>
          <p className="text-gray-500 mt-2 font-medium">Quản lý cơ cấu phòng ban và đơn vị trực thuộc hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          {hasImportExcel && (
            <button onClick={() => setIsImportOpen(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              <FileSpreadsheet size={20} /> Nhập Excel
            </button>
          )}
          <button onClick={() => { setDepartmentToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
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
              placeholder="Tìm kiếm theo mã, tên khoản phòng..." 
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
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Mã Khoa Phòng</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Tên Khoa Phòng</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Mô tả / Ghi chú</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-right">Điều khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center font-bold text-gray-400">Đang đồng bộ cơ cấu phòng ban...</td></tr>
              ) : filteredDepartments.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">Bạn chưa đăng ký bất kỳ phòng ban nào.</td></tr>
              ) : (
                filteredDepartments.map((dept, index) => (
                  <tr key={dept.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                    <td className="p-5 text-center font-bold text-gray-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="p-5 font-mono text-sm font-bold text-gray-500 dark:text-gray-400">
                      {dept.code || '---'}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 border border-gray-200/50 dark:border-gray-700/50 group-hover:bg-primary/10 group-hover:text-primary transition shadow-sm">
                          <Building size={20} />
                        </div>
                        <span className="font-extrabold text-gray-900 dark:text-white text-[15px] group-hover:text-primary transition">{dept.name}</span>
                      </div>
                    </td>
                    <td className="p-5 font-semibold text-gray-600 dark:text-gray-300">{dept.description || '---'}</td>
                    <td className="p-5 text-right flex items-center justify-end gap-1">
                      <button onClick={() => { setDepartmentToEdit(dept); setIsFormOpen(true); }} className="p-2.5 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/20 hover:shadow-sm transition" title="Chỉnh sửa Chi tiết">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(dept.id)} className="p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 hover:shadow-sm transition" title="Xóa Khoa Phòng">
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

      <DepartmentFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSaved={fetchDepartments} 
        departmentToEdit={departmentToEdit} 
      />
      <DepartmentExcelImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onImported={fetchDepartments} 
      />
    </div>
  );
};
