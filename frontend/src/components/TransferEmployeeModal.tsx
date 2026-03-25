import { useState, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import apiClient from '../api/client';

export const TransferEmployeeModal = ({ isOpen, onClose, onSaved, employee }: any) => {
  const [formData, setFormData] = useState({
    toDepartmentId: '',
    transferDate: new Date().toISOString().substring(0, 10)
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      if (employee) {
        // Initial state
      }
    }
  }, [isOpen, employee]);

  const fetchDepartments = async () => {
    try {
      const { data } = await apiClient.get('/master/departments');
      setDepartments(data.filter((d: any) => d.id !== employee?.departmentId));
    } catch (e) {
      console.error('Error fetching departments');
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.toDepartmentId) return alert('Vui lòng chọn khoa chuyển đến');
    
    setLoading(true);
    try {
      await apiClient.post(`/employees/${employee.id}/transfer`, formData);
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi điều chuyển nhân viên');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/10 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <ArrowRightLeft className="text-primary" /> Điều chuyển khoa
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100/50 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Nhân viên:</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{employee?.fullName}</p>
            <p className="text-sm font-mono text-primary font-bold">{employee?.code}</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-bold">{employee?.department?.name}</span>
              <ArrowRightLeft size={14} className="text-gray-400" />
              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded font-bold italic">Khoa mới</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Chọn khoa chuyển đến *</label>
              <select 
                required 
                value={formData.toDepartmentId} 
                onChange={e => setFormData({...formData, toDepartmentId: e.target.value})} 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-bold"
              >
                <option value="">-- Chọn khoa phòng --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ngày chuyển hiệu lực *</label>
              <input 
                type="date" 
                required 
                value={formData.transferDate} 
                onChange={e => setFormData({...formData, transferDate: e.target.value})} 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-bold" 
              />
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium italic mt-1">
                * Dữ liệu chấm công trước ngày này sẽ được giữ lại tại khoa cũ.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">Huỷ</button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang lý...' : 'Xác nhận chuyển'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
