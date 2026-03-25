import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/client';

export const SupplierFormModal = ({ isOpen, onClose, onSaved, supplierToEdit }: any) => {
  const [formData, setFormData] = useState<any>({
    code: '', name: '', contact: '', email: '', phone: '', status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        setFormData({ ...supplierToEdit });
      } else {
        setFormData({ code: '', name: '', contact: '', email: '', phone: '', status: 'ACTIVE' });
      }
    }
  }, [isOpen, supplierToEdit]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (supplierToEdit) {
        await apiClient.put(`/suppliers/${supplierToEdit.id}`, formData);
      } else {
        await apiClient.post('/suppliers', formData);
      }
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi lưu dữ liệu NCC');
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
            {supplierToEdit ? 'Chỉnh sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tên NCC *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="Tên công ty..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mã NCC</label>
              <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="VD: NCC-01" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Số điện thoại</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none" placeholder="09xxxx" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tính trạng</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none">
                <option value="ACTIVE">⚡ Hoạt động</option>
                <option value="INACTIVE">⛔ Dừng hoạt động</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Người liên hệ / Thông tin khác</label>
              <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none" placeholder="Họ tên người đại diện..." />
            </div>
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
