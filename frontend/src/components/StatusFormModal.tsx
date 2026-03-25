import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/client';

export const StatusFormModal = ({ isOpen, onClose, onSaved, statusToEdit }: any) => {
  const [formData, setFormData] = useState({ matt: '', tentt: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (statusToEdit) {
        setFormData({
          matt: statusToEdit.matt.toString(),
          tentt: statusToEdit.tentt
        });
      } else {
        setFormData({ matt: '', tentt: '' });
      }
    }
  }, [isOpen, statusToEdit]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (statusToEdit) {
        await apiClient.put(`/asset-statuses/${statusToEdit.matt}`, { tentt: formData.tentt });
      } else {
        await apiClient.post('/asset-statuses', { matt: parseInt(formData.matt), tentt: formData.tentt });
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/10">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-700/50 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {statusToEdit ? 'Chỉnh sửa Tình trạng' : 'Thêm Tình trạng Mới'}
          </h2>
          <button onClick={onClose} className="p-2.5 bg-gray-100/50 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:bg-gray-700/50 dark:hover:bg-red-500/20 rounded-full transition-all active:scale-95">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mã tình trạng (Số) *</label>
              <input 
                type="number" 
                required 
                disabled={!!statusToEdit}
                value={formData.matt} 
                onChange={e => setFormData({...formData, matt: e.target.value})} 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium font-mono" 
                placeholder="VD: 7" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tên Tình trạng *</label>
              <input 
                type="text" 
                required 
                value={formData.tentt} 
                onChange={e => setFormData({...formData, tentt: e.target.value})} 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium" 
                placeholder="VD: Đang sửa chữa..." 
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700/50">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all">Huỷ bỏ</button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transform active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100">
              {loading ? 'Đang xử lý...' : 'Lưu Dữ liệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
