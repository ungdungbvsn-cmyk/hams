import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Edit, Trash2, Search, Activity } from 'lucide-react';
import { StatusFormModal } from '../components/StatusFormModal';

export const StatusList = () => {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/asset-statuses');
      setStatuses(data);
    } catch (error) {
      console.error('Failed to fetch asset statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (matt: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tình trạng này?')) return;
    try {
      await apiClient.delete(`/asset-statuses/${matt}`);
      fetchStatuses();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi xóa');
    }
  };

  const filteredStatuses = statuses.filter(s => 
    s.tentt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matt.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
            <Activity size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danh mục Tình trạng</h1>
            <p className="text-gray-500 text-sm mt-0.5">Quản lý các trạng thái hoạt động của tài sản</p>
          </div>
        </div>
        <button 
          onClick={() => { setSelectedStatus(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold font-sans shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Thêm Tình trạng Mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hoặc tên tình trạng..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700 text-center w-12">STT</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Mã (matt)</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Tên Tình trạng (tentt)</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center text-gray-500 font-medium">Đang tải dữ liệu...</td></tr>
              ) : filteredStatuses.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-gray-500 font-medium">Không tìm thấy tình trạng nào.</td></tr>
              ) : filteredStatuses.map((status, index) => (
                <tr key={status.matt} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition group">
                  <td className="py-4 px-6 text-center font-bold text-gray-400 text-xs">{index + 1}</td>
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded text-sm">{status.matt}</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{status.tentt}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedStatus(status); setIsModalOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(status.matt)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StatusFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchStatuses}
        statusToEdit={selectedStatus}
      />
    </div>
  );
};
