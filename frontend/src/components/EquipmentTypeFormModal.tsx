import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { X, Save, Box } from 'lucide-react';

export const EquipmentTypeFormModal = ({ isOpen, onClose, onSaved, typeToEdit }: any) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (typeToEdit) {
        setFormData({
          code: typeToEdit.code,
          name: typeToEdit.name,
          description: typeToEdit.description || ''
        });
      } else {
        setFormData({ code: '', name: '', description: '' });
      }
    }
  }, [isOpen, typeToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (typeToEdit) {
        await apiClient.put(`/equipment-types/${typeToEdit.id}`, formData);
      } else {
        await apiClient.post('/equipment-types', formData);
      }
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl font-bold">
              <Box size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {typeToEdit ? 'Chỉnh sửa Loại' : 'Thêm Loại Thiết bị'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mã Loại (matb) *</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-bold font-mono text-primary uppercase"
              placeholder="VD: MAY-X-QUANG"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tên Loại (tentb) *</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-bold"
              placeholder="VD: Máy X-Quang kỹ thuật số"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mô tả chi tiết</label>
            <textarea
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition min-h-[100px] font-medium"
              placeholder="Nhập mô tả về loại thiết bị này..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30 transition disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu dữ liệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
