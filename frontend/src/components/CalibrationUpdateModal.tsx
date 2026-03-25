import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { X, ShieldCheck, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export const CalibrationUpdateModal = ({ isOpen, onClose, asset, onUpdated }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    calibrationDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    result: 'PASS',
    certificateUrl: '',
    notes: '',
    performedBy: ''
  });

  useEffect(() => {
    if (asset && asset.calibrationCycle) {
      const today = new Date();
      const expDate = new Date(today.getTime() + asset.calibrationCycle * 24 * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        expirationDate: expDate.toISOString().split('T')[0]
      }));
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/calibrations', {
        assetId: asset.id,
        ...formData
      });
      onUpdated();
      onClose();
    } catch (error) {
      alert('Lỗi khi cập nhật hồ sơ kiểm định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl border border-white/10 overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl font-bold dark:bg-blue-900/40">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Cập nhật Hồ sơ Kiểm định</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Đang cập nhật cho:</p>
            <p className="text-lg font-black text-gray-900 dark:text-white uppercase leading-tight">{asset.name}</p>
            <p className="text-sm font-bold text-gray-500 mt-1">Mã thiết bị: {asset.assetCode}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ngày thực hiện *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="date"
                  required
                  value={formData.calibrationDate}
                  onChange={e => setFormData({...formData, calibrationDate: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-sm font-medium"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Hạn tiếp theo *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="date"
                  required
                  value={formData.expirationDate}
                  onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Kết quả</label>
              <select
                value={formData.result}
                onChange={e => setFormData({...formData, result: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-sm font-bold"
              >
                <option value="PASS">ĐẠT (PASS)</option>
                <option value="FAIL">KHÔNG ĐẠT (FAIL)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Đơn vị thực hiện</label>
              <input 
                type="text"
                placeholder="Ví dụ: Trung tâm kiểm định X..."
                value={formData.performedBy}
                onChange={e => setFormData({...formData, performedBy: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Link hồ sơ / chứng chỉ (URL)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Dán link OneDrive/Google Drive hồ sơ kiểm định..."
                value={formData.certificateUrl}
                onChange={e => setFormData({...formData, certificateUrl: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ghi chú thêm</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-sm font-medium"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Đang lưu...' : <><CheckCircle2 size={18} /> Lưu hồ sơ</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
