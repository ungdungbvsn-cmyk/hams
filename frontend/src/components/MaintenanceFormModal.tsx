import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/client';

export const MaintenanceFormModal = ({ isOpen, onClose, onSaved, recordToEdit }: any) => {
  const [formData, setFormData] = useState<any>({
    code: '', name: '', assetId: '', description: '', cost: '', status: 'PENDING', startDate: new Date().toISOString().substring(0, 10), endDate: '', contractorName: ''
  });
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/assets').then(res => setAssets(res.data)).catch();
      if (recordToEdit) {
        setFormData({ 
            ...recordToEdit, 
            startDate: recordToEdit.startDate ? recordToEdit.startDate.substring(0, 10) : '',
            endDate: recordToEdit.endDate ? recordToEdit.endDate.substring(0, 10) : '',
        });
      } else {
        setFormData({ code: '', name: '', assetId: '', description: '', cost: '', status: 'PENDING', startDate: new Date().toISOString().substring(0, 10), endDate: '', contractorName: '' });
      }
    }
  }, [isOpen, recordToEdit]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (recordToEdit) {
        await apiClient.put(`/maintenances/${recordToEdit.id}`, formData);
      } else {
        await apiClient.post('/maintenances', formData);
      }
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi xử lý phiếu bảo trì sửa chữa!');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {recordToEdit ? 'Chi tiết Phiếu Sửa Chữa' : 'Tạo Phiếu Sửa Chữa Mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tên phiếu / Nội dung *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-sm" placeholder="VD: Sửa chữa máy siêu âm..." />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Thiết bị cần bảo trì *</label>
            <select required value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-sm">
              <option value="">-- Chọn 1 Thiết bị --</option>
              {assets.map((a: any) => <option key={a.id} value={a.id}>[{a.assetCode}] {a.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trạng thái xử lý</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 outline-none font-bold text-sm transition">
                <option value="PENDING" className="text-amber-600">Chờ xử lý</option>
                <option value="IN_PROGRESS" className="text-blue-600">Đang sửa chữa</option>
                <option value="COMPLETED" className="text-green-600">Đã hoàn thành</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chi phí dự kiến</label>
              <input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-sm" placeholder="VNĐ" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Đơn vị thầu / Người phụ trách</label>
            <input type="text" value={formData.contractorName} onChange={e => setFormData({...formData, contractorName: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ngày bắt đầu *</label>
              <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ngày hoàn thành</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ghi chú chi tiết</label>
            <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-sm" />
          </div>
        </form>
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition shadow-sm">Đóng cửa sổ</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition">{loading ? 'Đang gửi lệnh...' : 'Lưu lại'}</button>
        </div>
      </div>
    </div>
  );
};
