import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { format } from 'date-fns';
import { Trash2, AlertTriangle, Search, CheckCircle, FileText, Upload } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const LiquidationList = () => {
  const [liquidations, setLiquidations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLiquidation, setSelectedLiquidation] = useState<any>(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLiquidations();
  }, []);

  const fetchLiquidations = async () => {
    try {
      const { data } = await apiClient.get('/liquidations');
      setLiquidations(data);
    } catch (error) {
      console.error('Failed to fetch liquidations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.put(`/liquidations/${selectedLiquidation.id}/complete`, { documentUrl, reason });
      setIsModalOpen(false);
      setDocumentUrl('');
      setReason('');
      fetchLiquidations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi thanh lý');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = liquidations.filter(l => 
    l.asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 className="text-primary" /> Thanh lý tài sản
          </h1>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Quản lý danh sách các tài sản, thiết bị chờ thanh lý và đã thanh lý</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài sản, mã thiết bị..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 transition outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">STT</th>
                <th className="p-4">Mã Thiết bị</th>
                <th className="p-4">Tên Thiết bị</th>
                <th className="p-4">Ngày đưa vào</th>
                <th className="p-4">Trạng thái TB</th>
                <th className="p-4">Tiến độ</th>
                <th className="p-4">Lý do</th>
                <th className="p-4">Hồ sơ</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-400">Đang tải biểu mẫu...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-400">Không có dữ liệu thanh lý</td></tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition duration-150">
                    <td className="p-4 text-sm font-medium">{index + 1}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-mono font-bold">{item.asset.assetCode}</span></td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-gray-100">{item.asset.name}</td>
                    <td className="p-4 text-sm">{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                    <td className="p-4">
                      {item.asset.statusId === 1 ? (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full"><AlertTriangle size={12}/> Hỏng</span>
                      ) : (
                        <span className="text-gray-500 text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">Ngừng HĐ</span>
                      )}
                    </td>
                    <td className="p-4">
                      {item.status === 'COMPLETED' ? (
                        <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm"><CheckCircle size={16}/> Đã thanh lý</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-orange-500 font-bold text-sm animate-pulse"><AlertTriangle size={16}/> Chờ thanh lý</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={item.reason}>{item.reason}</td>
                    <td className="p-4">
                      {item.documentUrl ? (
                        <a href={item.documentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm font-semibold">
                          <FileText size={16}/> Xem Link
                        </a>
                      ) : <span className="text-gray-400 text-sm italic">-</span>}
                    </td>
                    <td className="p-4 text-right">
                      {item.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={async () => {
                              if (!window.confirm('Bạn có chắc chắn muốn hoàn lại thiết bị này về danh sách tài sản (Trạng thái: Hỏng)?')) return;
                              try {
                                await apiClient.delete(`/liquidations/${item.id}/revert`);
                                fetchLiquidations();
                              } catch (e: any) { alert(e.response?.data?.error || 'Lỗi hệ thống'); }
                            }}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition font-bold text-xs"
                          >
                            Hoàn lại
                          </button>
                          <button 
                            onClick={() => { 
                              setSelectedLiquidation(item); 
                              setDocumentUrl(item.documentUrl || '');
                              setReason(item.reason || '');
                              setIsModalOpen(true); 
                            }}
                            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition font-bold text-xs"
                          >
                            Hoàn tất
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedLiquidation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden slide-in-from-bottom-4">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <h3 className="font-bold text-lg dark:text-white">Hoàn tất thanh lý</h3>
            </div>
            <form onSubmit={handleComplete} className="p-6 space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm dark:text-gray-300">Thiết bị: <strong className="text-primary">{selectedLiquidation.asset.name}</strong></p>
                <p className="text-sm dark:text-gray-300 mt-1">Mã TS: <strong>{selectedLiquidation.asset.assetCode}</strong></p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Đường dẫn Hồ sơ Thanh lý gốc *
                </label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Sử dụng URL đến thư mục Drive/Sharepoint chứa biên bản định giá, quyết định thanh lý, hoá đơn bán tài sản...</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Lý do thanh lý (Có thể chỉnh sửa)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 transition outline-none font-medium text-sm"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
