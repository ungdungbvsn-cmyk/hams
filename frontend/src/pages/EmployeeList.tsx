import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Search, Trash2, Edit, FileSpreadsheet, ArrowRightLeft, History as HistoryIcon } from 'lucide-react';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { EmployeeExcelImportModal } from '../components/EmployeeExcelImportModal';
import { TransferEmployeeModal } from '../components/TransferEmployeeModal';
import { TransferHistoryModal } from '../components/TransferHistoryModal';
import { useAuthStore } from '../store/useAuthStore';

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  startDate: string;
  endDate: string;
  department: Department;
  departmentId: number;
}

export const EmployeeList = () => {
  const { user } = useAuthStore();
  const hasImportExcel = user?.role?.name === 'ADMIN' || (user?.permissions as any)?.importExcel;
  const canTransfer = user?.role?.name === 'ADMIN' || user?.role?.name === 'MANAGER';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToTransfer, setEmployeeToTransfer] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
    apiClient.get('/master/departments').then(res => setDepartments(res.data)).catch(console.error);
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await apiClient.get('/employees');
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Cảnh báo: Xoá nhân viên này? Hệ thống sẽ chặn nếu nhân viên đang giữ tài sản hoặc có phiếu hỗ trợ kỹ thuật.')) {
      try {
        await apiClient.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Lỗi hệ thống khi xoá');
      }
    }
  };

  const filteredEmployees = employees.filter(e => 
    ((e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.department && e.department.name.toLowerCase().includes(searchTerm.toLowerCase())))) &&
    (selectedDept ? e.department?.id === Number(selectedDept) : true)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Nhân sự</h1>
          <p className="text-gray-500 mt-2 font-medium">Danh sách Nhân viên và Bác sĩ trong hệ thống HAMS</p>
        </div>
        <div className="flex items-center gap-3">
          {hasImportExcel && (
            <button onClick={() => setIsImportOpen(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              <FileSpreadsheet size={20} /> Nhập Excel
            </button>
          )}
          <button onClick={() => { setEmployeeToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus size={20} /> Tạo Mới
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã, tên, khoa phòng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition font-medium"
            />
          </div>
          <div className="w-full md:w-64">
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none font-medium"
            >
              <option value="">Tất cả khoa phòng</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="p-5 font-bold uppercase tracking-wider text-[10px] text-center w-12">STT</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Mã NV</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Họ và Tên</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Chức vụ & Khoa</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Trạng thái</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-right">Điều khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center font-bold text-gray-400">Đang tải hồ sơ nhân sự...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500 font-medium">Không tìm thấy Hồ sơ nào.</td></tr>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                    <td className="p-5 text-center font-bold text-gray-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="p-5 font-mono text-sm font-bold text-gray-500">{emp.code}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold border border-blue-200 dark:border-blue-800">
                          {emp.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-gray-900 dark:text-white text-[15px]">{emp.fullName}</span>
                          <span className="text-xs text-gray-500 font-mono tracking-tight mt-0.5">{emp.email} | {emp.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{emp.position || 'Nhân viên'}</span>
                        <span className="text-sm text-gray-500 font-medium truncate max-w-[200px]">{emp.department?.name || '---'}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-[0.4rem] text-[11px] font-extrabold tracking-widest uppercase shadow-sm ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {emp.status === 'ACTIVE' ? 'Đang LÀM VIỆC' : 'ĐÃ KHOÁ / NGHỈ'}
                      </span>
                    </td>
                    <td className="p-5 text-right flex items-center justify-end gap-1">
                      {canTransfer && (
                        <>
                          <button 
                            onClick={() => { setEmployeeToTransfer(emp); setIsTransferOpen(true); }} 
                            className="p-2.5 rounded-xl text-primary hover:text-white hover:bg-primary transition" 
                            title="Điều chuyển khoa"
                          >
                            <ArrowRightLeft size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedEmployee(emp); setIsHistoryModalOpen(true); }} 
                            className="p-2.5 rounded-xl text-blue-500 hover:text-white hover:bg-blue-500 transition" 
                            title="Lịch sử điều chuyển"
                          >
                            <HistoryIcon size={18} />
                          </button>
                        </>
                      )}
                      <button onClick={() => { setEmployeeToEdit(emp); setIsFormOpen(true); }} className="p-2.5 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition" title="Chửa sửa">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Xóa">
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

      <EmployeeFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={fetchEmployees} employeeToEdit={employeeToEdit} />
      <TransferEmployeeModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} onSaved={fetchEmployees} employee={employeeToTransfer} />
      <EmployeeExcelImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImported={fetchEmployees} />
      <TransferHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
};
