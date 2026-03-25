import { useState } from 'react';
import apiClient from '../api/client';
import { X, AlertTriangle, Send } from 'lucide-react';

export const BreakdownReportModal = ({ isOpen, onClose, onReported, asset }: any) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Reporting breakdown for asset:', asset.id, 'description:', description);
    try {
      await apiClient.post(`/assets/${asset.id}/report-breakdown`, { description });
      onReported();
      onClose();
      setDescription('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi báo hỏng thiết bị');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-red-50/50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl font-bold dark:bg-red-900/40">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Báo hỏng thiết bị</h2>
              <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mt-0.5">{asset.assetCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Thiết bị:</p>
            <p className="text-lg font-extrabold text-primary dark:text-primary-light">{asset.name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mô tả hiện trạng hỏng hóc *</label>
            <textarea
              required
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none transition min-h-[120px] font-medium"
              placeholder="Ví dụ: Máy không lên nguồn, màn hình bị sọc, hoặc có tiếng kêu lạ..."
              value={description}
              onChange={e => setDescription(e.target.value)}
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
              disabled={loading || !description.trim()}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 transition disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'Đang gửi...' : <><Send size={18} /> Gửi yêu cầu</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
