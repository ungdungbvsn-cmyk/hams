import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/client';

export const EmployeeFormModal = ({ isOpen, onClose, onSaved, employeeToEdit }: any) => {
  const [formData, setFormData] = useState<any>({
    code: '', fullName: '', email: '', phone: '', position: '', status: 'ACTIVE', startDate: '', endDate: '', departmentId: ''
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/departments').then(res => setDepartments(res.data)).catch(console.error);
      
      if (employeeToEdit) {
        setFormData({ 
            ...employeeToEdit, 
            startDate: employeeToEdit.startDate ? employeeToEdit.startDate.substring(0, 10) : '',
            endDate: employeeToEdit.endDate ? employeeToEdit.endDate.substring(0, 10) : '',
        });
      } else {
        setFormData({ code: '', fullName: '', email: '', phone: '', position: '', status: 'ACTIVE', startDate: '', endDate: '', departmentId: '' });
      }
    }
  }, [isOpen, employeeToEdit]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.departmentId) return alert('Vui lòng chọn Khoa phòng.');
    setLoading(true);
    try {
      if (employeeToEdit) {
        await apiClient.put(`/employees/${employeeToEdit.id}`, formData);
      } else {
        await apiClient.post('/employees', formData);
      }
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi lưu dữ liệu Nhân sự');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {employeeToEdit ? 'Cập Nhật Hồ Sơ Nhân Sự' : 'Đăng Ký Nhân Viên'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mã Nhân Viên *</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="VD: NV001" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Họ và Tên *</label>
              <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email LH</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="Tùy chọn. Mặc định: mã@hospital" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">SĐT Điều phối</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="09xxxx" />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Chức vụ / Cấp bậc</label>
              <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="Bác sĩ CKI, Y tá, Trưởng khoa..." />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Khoa / Phòng ban quản lý *</label>
              <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none">
                <option value="">-- Chọn Đơn vị --</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ký hợp đồng (Từ ngày)</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Kết thúc (Đến ngày)</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tính trạng Hoạt Động</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-bold text-sm">
                <option value="ACTIVE" className="text-green-600">⚡ ĐANG GIAO VIỆC / HOẠT ĐỘNG</option>
                <option value="INACTIVE" className="text-gray-500">⛔ TẠM NGHỈ / KHOÁ TRUY CẬP</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition">Hủy bỏ</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition">{loading ? 'Đang lưu...' : 'Lưu Hồ Sơ'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
