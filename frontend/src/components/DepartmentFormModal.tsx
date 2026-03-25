import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/client';

export const DepartmentFormModal = ({ isOpen, onClose, onSaved, departmentToEdit }: any) => {
  const [formData, setFormData] = useState<any>({
    code: '', name: '', description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (departmentToEdit) {
        setFormData({ ...departmentToEdit });
      } else {
        setFormData({ code: '', name: '', description: '' });
      }
    }
  }, [isOpen, departmentToEdit]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (departmentToEdit) {
        await apiClient.put(`/departments/${departmentToEdit.id}`, formData);
      } else {
        await apiClient.post('/departments', formData);
      }
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi lưu dữ liệu Khoa phòng');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {departmentToEdit ? 'Chỉnh sửa Khoa Phòng' : 'Thêm Cơ Cấu Mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tên Khoa/Phòng *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="Khoa Tự chọn..." />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mã Khoa/Phòng</label>
            <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="Để trống nếu cần tạo tự động..." />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mô tả / Ghi chú</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none resize-none" placeholder="Tuỳ chọn cung cấp mô tả chi tiết..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 transition">Hủy bỏ</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition">{loading ? 'Đang lưu...' : 'Lưu lại'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
