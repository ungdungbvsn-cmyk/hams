import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export const UserFormModal = ({ onClose, onSaved, userToEdit }: any) => {
  const { user: currentUser } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    roleId: 2,
    employeeId: '',
    permissions: {
      manageCategories: false,
      manageAssets: false,
      timekeepingPast: false,
      accessMaintenance: false,
      accessMovement: false,
      accessLiquidation: false,
      manageEmployees: false,
      manageSuppliers: false,
      manageDepartments: false,
      manageEquipmentTypes: false,
      manageTimekeepingSymbols: false,
      manageUsers: false,
      importExcel: false,
      manageAssetStatuses: false,
    },
    departments: [] as number[]
  });

  const [roles, setRoles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (userToEdit) {
      setFormData({
        username: userToEdit.username,
        password: '',
        roleId: userToEdit.roleId,
        employeeId: userToEdit.employeeId || '',
        permissions: userToEdit.permissions || {
          manageCategories: false,
          manageAssets: false,
          timekeepingPast: false,
          accessMaintenance: false,
          accessMovement: false,
          accessLiquidation: false,
          manageEmployees: false,
          manageSuppliers: false,
          manageDepartments: false,
          manageEquipmentTypes: false,
          manageTimekeepingSymbols: false,
          manageUsers: false,
          importExcel: false,
          manageAssetStatuses: false,
        },
        departments: userToEdit.departments?.map((d: any) => d.id) || []
      });
    }
  }, [userToEdit]);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        apiClient.get('/employees'),
        apiClient.get('/departments')
      ]);
      setEmployees(empRes.data);
      setDepartmentsList(deptRes.data);
      // Hardcoded roles assuming ID 1=ADMIN, 2=USER from seed
      setRoles([
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'USER' }
      ]);
    } catch (error) {
      console.error('Fetch errors', error);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (e: any) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [e.target.name]: e.target.checked
      }
    });
  };

  const handleDepartmentChange = (id: number) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(id) 
        ? prev.departments.filter(d => d !== id)
        : [...prev.departments, id]
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password;
      if (!payload.employeeId) payload.employeeId = null;

      if (userToEdit) {
        await apiClient.put(`/users/${userToEdit.id}`, payload);
      } else {
        await apiClient.post('/users', payload);
      }
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {userToEdit ? 'Chỉnh sửa Tài khoản' : 'Tạo Tài khoản mới'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Username *</label>
              <input 
                required 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange}
                disabled={!!userToEdit && currentUser?.role?.name !== 'ADMIN'}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mật khẩu {userToEdit && '(Bỏ trống nếu không đổi)'}</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange}
                required={!userToEdit}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Vai trò</label>
              <select 
                name="roleId" 
                value={formData.roleId} 
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium"
              >
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Liên kết Nhân viên</label>
              <select 
                name="employeeId" 
                value={formData.employeeId} 
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium"
              >
                <option value="">-- Không liên kết --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.code} - {e.fullName}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Khoa phòng quản lý (Chỉ áp dụng nếu không phải ADMIN)</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
              {departmentsList.map(dept => (
                <label key={dept.id} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.departments.includes(dept.id)} 
                    onChange={() => handleDepartmentChange(dept.id)} 
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" 
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1" title={dept.name}>{dept.name}</span>
                </label>
              ))}
              {departmentsList.length === 0 && <p className="text-sm text-gray-500 col-span-full">Không có dữ liệu khoa phòng.</p>}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Phân quyền chi tiết (chỉ áp dụng nếu không phải là ADMIN)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="manageCategories" checked={formData.permissions.manageCategories} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quản lý các danh mục</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="manageAssets" checked={formData.permissions.manageAssets} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sửa, xoá tài sản/thiết bị</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="timekeepingPast" checked={formData.permissions.timekeepingPast} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chấm công quá khứ</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="accessMaintenance" checked={formData.permissions.accessMaintenance} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bảo trì & Kiểm định</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="accessMovement" checked={formData.permissions.accessMovement} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Luân chuyển tài sản</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="accessLiquidation" checked={formData.permissions.accessLiquidation} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thanh lý tài sản</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="importExcel" checked={formData.permissions.importExcel} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhập dữ liệu Excel</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="manageEmployees" checked={formData.permissions.manageEmployees} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhân viên</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="manageSuppliers" checked={formData.permissions.manageSuppliers} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhà cung cấp</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="manageDepartments" checked={formData.permissions.manageDepartments} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Khoa phòng</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="manageEquipmentTypes" checked={formData.permissions.manageEquipmentTypes} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại thiết bị</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="manageTimekeepingSymbols" checked={formData.permissions.manageTimekeepingSymbols} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ký hiệu chấm công</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="manageAssetStatuses" checked={formData.permissions.manageAssetStatuses} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quản lý Tình trạng tài sản</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="manageUsers" checked={formData.permissions.manageUsers} onChange={handlePermissionChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Người dùng</span>
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">Hủy</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/30">
              <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
