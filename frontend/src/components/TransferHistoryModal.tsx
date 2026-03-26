import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { X, Clock, Edit2, ArrowRight } from 'lucide-react';
import { EditTransferModal } from './EditTransferModal';

interface TransferHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

export const TransferHistoryModal = ({ isOpen, onClose, employee }: TransferHistoryModalProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      fetchHistory();
    }
  }, [isOpen, employee]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/employees/${employee.id}/transfer-history`);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch transfer history');
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <Clock className="text-blue-500" size={28} /> Lịch sử Điều chuyển
              </h3>
              <p className="text-gray-500 font-bold text-sm mt-1">{employee?.fullName} - {employee?.code}</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition">
              <X size={24} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                <p className="text-gray-400 font-bold">Chưa có lịch sử điều chuyển cho nhân viên này.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((h) => (
                  <div key={h.id} className="group flex items-center justify-between p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[2rem] hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${h.endDate ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600 animate-pulse-slow'}`}>
                         <ArrowRight size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Đến Khoa/Phòng</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{h.department?.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">
                             Từ: {new Date(h.startDate).toLocaleDateString('vi-VN')}
                           </span>
                           {h.endDate && (
                             <span className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold">
                               Đến: {new Date(h.endDate).toLocaleDateString('vi-VN')}
                             </span>
                           )}
                           {!h.endDate && (
                             <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold">
                               Hiện tại
                             </span>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedTransfer(h); setIsEditOpen(true); }}
                        className="p-3 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition shadow-sm border border-emerald-100 dark:border-emerald-800"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-8 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 text-right">
             <button
               onClick={onClose}
               className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
             >
               Đóng cửa sổ
             </button>
          </div>
        </div>
      </div>

      <EditTransferModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        transfer={selectedTransfer}
        onSaved={fetchHistory}
      />
    </>
  );
};
