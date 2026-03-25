import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Activity, Search, Clock, User, HardDrive } from 'lucide-react';
import { format } from 'date-fns';

export const ActivityLogList = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/activity-logs');
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-green-600 bg-green-50 dark:bg-green-900/30';
    if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30';
    if (action.includes('DELETE')) return 'text-red-600 bg-red-50 dark:bg-red-900/30';
    if (action.includes('LOGIN')) return 'text-purple-600 bg-purple-50 dark:bg-purple-900/30';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl shadow-sm">
            <Activity size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nhật ký Hoạt động</h1>
            <p className="text-gray-500 text-sm mt-0.5">Truy vết các thao tác của người dùng trên toàn hệ thống</p>
          </div>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-xl font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo hành động, tài nguyên, người dùng..."
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
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Thời gian</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Người dùng</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Hành động</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Tài nguyên</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500 font-medium font-sans">Đang truy xuất nhật ký...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500 font-medium">Không tìm thấy bản ghi nào.</td></tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition group">
                  <td className="py-4 px-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                       <Clock size={14} className="text-gray-400" />
                       {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{log.user?.employee?.fullName || log.user?.username || 'Hệ thống'}</p>
                        <p className="text-xs text-gray-400 font-medium">@{log.user?.username || 'system'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider shadow-sm ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-semibold">
                       <HardDrive size={14} className="text-gray-400" />
                       {log.resource}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs text-gray-500 dark:text-gray-500 font-mono truncate max-w-xs" title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
