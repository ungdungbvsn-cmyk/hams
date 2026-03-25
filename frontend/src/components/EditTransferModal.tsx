import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { X, Save, Calendar, Building2 } from 'lucide-react';

interface EditTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: any;
  onSaved: () => void;
}

export const EditTransferModal = ({ isOpen, onClose, transfer, onSaved }: EditTransferModalProps) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    departmentId: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      if (transfer) {
        setFormData({
          departmentId: transfer.departmentId.toString(),
          startDate: new Date(transfer.startDate).toISOString().split('T')[0],
          endDate: transfer.endDate ? new Date(transfer.endDate).toISOString().split('T')[0] : ''
        });
      }
    }
  }, [isOpen, transfer]);

  const fetchDepartments = async () => {
    try {
      const { data } = await apiClient.get('/departments');
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.put(`/employees/transfer/${transfer.id}`, {
        ...formData,
        departmentId: Number(formData.departmentId)
      });
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật điều chuyển');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <Building2 className="text-blue-500" size={24} /> Chỉnh sửa Điều chuyển
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Khoa phòng chuyển đến</label>
            <select
              required
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition outline-none font-medium"
            >
              <option value="">Chọn khoa phòng</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ngày hiệu lực (Từ ngày)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-mono uppercase tracking-tighter">Ngày kết thúc (Không bắt buộc)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition outline-none font-medium text-red-500"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1 italic">* Để trống nếu đây là khoa phòng hiện tại.</p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
