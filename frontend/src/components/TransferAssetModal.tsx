import { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export const TransferAssetModal = ({ isOpen, onClose, onSaved, asset }: any) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    departmentId: '',
    receiveDate: new Date().toISOString().substring(0, 10),
    receiverId: ''
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      if (asset) {
        setFormData(prev => ({ ...prev, departmentId: '', receiverId: '' }));
      }
    }
  }, [isOpen, asset]);

  useEffect(() => {
    if (formData.departmentId) {
      fetchEmployees(formData.departmentId);
    } else {
      setEmployees([]);
    }
  }, [formData.departmentId]);

  const fetchDepartments = async () => {
    try {
      const { data } = await apiClient.get('/master/departments');
      let filteredDepts = data.filter((d: any) => d.id !== asset?.departmentId);
      
      // Restriction: Broken assets can ONLY be transferred by ADMIN, 
      // or to "Khoa Dược - vật tư y tế" if user is not Admin but logic allows (though user wants Admin only for broken transfers overall)
      if (asset?.statusId === 1 && user?.role?.name?.toUpperCase() !== 'ADMIN') {
        // Option 1: Only allow to "Khoa Dược - vật tư y tế"
        filteredDepts = filteredDepts.filter((d: any) => d.name === 'Khoa Dược - vật tư y tế');
      }

      setDepartments(filteredDepts);
    } catch (e) {
      console.error('Error fetching departments');
    }
  };

  const fetchEmployees = async (deptId: string) => {
    try {
      const { data } = await apiClient.get(`/employees?departmentId=${deptId}`);
      setEmployees(data);
    } catch (e) {
      console.error('Error fetching employees');
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.departmentId) return alert('Vui lòng chọn khoa phòng nhận');
    
    setLoading(true);
    try {
      await apiClient.post(`/assets/${asset.id}/transfer`, formData);
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi luân chuyển tài sản');
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
            <RefreshCw className="text-blue-500" /> Luân chuyển thiết bị
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100/50 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Thiết bị:</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{asset?.name}</p>
            <p className="text-sm font-mono text-blue-600 font-bold">{asset?.assetCode}</p>
          </div>

          {asset?.statusId === 1 && user?.role?.name?.toUpperCase() !== 'ADMIN' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30 text-yellow-800 dark:text-yellow-200 text-xs font-bold uppercase tracking-wide">
              Lưu ý: Thiết bị đang hỏng. Chỉ Admin mới có quyền luân chuyển tự do. 
              Bạn chỉ có thể luân chuyển về Khoa Dược - Vật tư y tế.
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Khoa phòng nhận *</label>
              <select 
                required 
                value={formData.departmentId} 
                onChange={e => setFormData({...formData, departmentId: e.target.value})} 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-blue-500 outline-none font-bold"
              >
                <option value="">-- Chọn khoa phòng --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Người nhận bàn giao</label>
              <select 
                value={formData.receiverId} 
                onChange={e => setFormData({...formData, receiverId: e.target.value})} 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-blue-500 outline-none font-bold text-sm"
              >
                <option value="">Không bắt buộc</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.code})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ngày luân chuyển *</label>
              <input 
                type="date" 
                required 
                value={formData.receiveDate} 
                onChange={e => setFormData({...formData, receiveDate: e.target.value})} 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-blue-500 outline-none font-bold" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">Huỷ</button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang thực hiện...' : 'Xác nhận luân chuyển'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
