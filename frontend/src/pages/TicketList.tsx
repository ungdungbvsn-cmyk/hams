import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export const TicketList = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await apiClient.get('/tickets');
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      case 'CLOSED': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'HIGH':
      case 'CRITICAL': return <AlertTriangle size={16} className="text-red-500" />;
      case 'MEDIUM': return <Clock size={16} className="text-orange-500" />;
      default: return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Quản trị Yêu cầu Hỗ trợ</h1>
          <p className="text-gray-500 mt-2 font-medium">Xử lý các phiếu báo hỏng, bảo dưỡng thiết bị từ các khoa phòng</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all">
          <Plus size={20} /> Tạo Phiếu Hỗ Trợ
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="p-5 font-bold uppercase tracking-wider text-[10px] text-center w-12 text-xs">STT</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Phản ánh / Thiết bị</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Người yêu cầu</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Mức độ cảnh báo</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Ngày ghi nhận</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Tình trạng</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-right">Phân bổ xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="p-10 text-center font-medium text-gray-400">Đang quét hệ thống...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={7} className="p-16 text-center text-gray-500 font-medium text-lg border-2 border-dashed border-gray-100 dark:border-gray-700 m-8 rounded-2xl block bg-gray-50/50 dark:bg-gray-900/50">Hệ thống Y Tế hiện không có ticket lỗi nào báo cáo từ Khoa/Phòng.</td></tr>
              ) : (
                tickets.map((ticket, index) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition group">
                    <td className="p-5 text-center font-bold text-gray-400 text-xs">{index + 1}</td>
                    <td className="p-5">
                      <p className="font-bold text-gray-900 dark:text-white">{ticket.title}</p>
                      <p className="text-sm text-primary mt-1 font-mono tracking-wide font-medium">{ticket.asset?.name || 'Vấn đề Hệ thống'}</p>
                    </td>
                    <td className="p-5">
                      <p className="text-gray-900 dark:text-white font-semibold">{ticket.requester?.fullName}</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded inline-block">{ticket.requester?.department?.name}</p>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(ticket.priority)}
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide">{ticket.priority}</span>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {format(new Date(ticket.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase shadow-sm ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-5 text-right flex justify-end">
                      <button className="text-primary hover:text-white hover:bg-primary font-bold text-sm bg-primary/10 border border-transparent hover:border-primary px-4 py-2 rounded-xl transition duration-300 shadow-sm">
                        Mở Hồ Sơ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
