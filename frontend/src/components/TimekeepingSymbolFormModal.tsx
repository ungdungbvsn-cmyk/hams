import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/client';

export const TimekeepingSymbolFormModal = ({ isOpen, onClose, onSaved, symbolToEdit }: any) => {
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (symbolToEdit) setFormData(symbolToEdit);
      else setFormData({ code: '', name: '' });
    }
  }, [isOpen, symbolToEdit]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (symbolToEdit) {
        await apiClient.put(`/timekeeping-symbols/${symbolToEdit.id}`, formData);
      } else {
        await apiClient.post('/timekeeping-symbols', formData);
      }
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {symbolToEdit ? 'Cập Nhật Ký Hiệu' : 'Thêm Ký Hiệu Chấm Công'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mã ký hiệu *</label>
            <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold uppercase transition" placeholder="VD: P, KP, RO..." />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tên ký hiệu / Ý nghĩa *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition" placeholder="VD: Nghỉ phép, Không phép..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">Hủy bỏ</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition">{loading ? 'Hệ thống đang lưu...' : 'Lưu Danh Mục'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
