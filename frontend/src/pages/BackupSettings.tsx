import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Database, Save, Play, Clock, Folder, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const BackupSettings = () => {
  const [config, setConfig] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, historyRes] = await Promise.all([
        apiClient.get('/backups/config'),
        apiClient.get('/backups/history')
      ]);
      setConfig(configRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Failed to fetch backup data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put('/backups/config', config);
      setMessage({ type: 'success', text: 'Cấu hình sao lưu đã được cập nhật.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Cập nhật cấu hình thất bại.' });
    }
  };

  const handleManualBackup = async () => {
    setBackingUp(true);
    setMessage({ type: 'success', text: 'Đang tiến hành sao lưu hệ thống...' });
    try {
      await apiClient.post('/backups/trigger');
      setMessage({ type: 'success', text: 'Sao lưu thành công!' });
      fetchData(); // Refresh history
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Sao lưu thất bại. Kiểm tra nhật ký lỗi.' });
    } finally {
      setBackingUp(false);
    }
  };

  const formatSize = (bytes: string) => {
    const b = parseInt(bytes);
    if (b === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !config) return <div className="p-8 text-center text-gray-500 font-medium">Đang tải cấu hình...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
            <Database size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Sao lưu (Backup)</h1>
            <p className="text-gray-500 text-sm mt-0.5">Thiết lập lưu trữ và lập lịch sao lưu dữ liệu tự động</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
            : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Thiết lập Sao lưu
            </h2>
            
            <form onSubmit={handleUpdateConfig} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Folder size={16} /> Nơi lưu trữ (Windows Path)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl font-medium outline-none focus:ring-2 focus:ring-primary/20 transition"
                  value={config.storagePath || ''}
                  onChange={(e) => setConfig({...config, storagePath: e.target.value})}
                  placeholder=" ví dụ: C:\HAMS\backups"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Lịch sao lưu (Cron format)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  value={config.schedule || ''}
                  onChange={(e) => setConfig({...config, schedule: e.target.value})}
                  placeholder="0 0 * * * (Hàng ngày lúc 00:00)"
                />
                <p className="mt-1.5 text-xs text-gray-400 font-medium">Định dạng: phút giờ ngày tháng thứ</p>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="autoBackup"
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                  checked={config.autoBackup || false}
                  onChange={(e) => setConfig({...config, autoBackup: e.target.checked})}
                />
                <label htmlFor="autoBackup" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Kích hoạt sao lưu tự động</label>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-95"
              >
                <Save size={20} /> Lưu cấu hình
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sao lưu tức thời</h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">Kích hoạt quá trình sao lưu dữ liệu ngay bây giờ.</p>
            <button 
              onClick={handleManualBackup}
              disabled={backingUp}
              className={`w-full font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 border shadow-sm ${
                backingUp 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 active:scale-95'
              }`}
            >
              <Play size={20} className={backingUp ? 'animate-pulse' : 'text-green-500'} /> 
              {backingUp ? 'Đang thực hiện...' : 'Bắt đầu Sao lưu'}
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lịch sử Sao lưu</h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{history.length} bản ghi gần nhất</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Thời gian</th>
                    <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Tên Tệp</th>
                    <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Kích thước</th>
                    <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {history.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-gray-500 font-medium">Chưa có lịch sử sao lưu.</td></tr>
                  ) : history.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition">
                      <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">
                        {format(new Date(h.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </td>
                      <td className="py-4 px-6 text-sm font-mono text-gray-600 dark:text-gray-400">
                        {h.filename}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-500">
                        {formatSize(h.size)}
                      </td>
                      <td className="py-4 px-6">
                        {h.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-600/20 shadow-sm uppercase">
                            <CheckCircle size={12} /> Thành công
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-600/20 shadow-sm uppercase" title={h.error}>
                            <XCircle size={12} /> Thất bại
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
