import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { UserFormModal } from '../components/UserFormModal';

export const UserList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Cảnh báo: Xoá tài khoản này?')) {
      try {
        await apiClient.delete(`/users/${id}`);
        fetchUsers();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Lỗi hệ thống khi xoá');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.employee && u.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Tài khoản Người dùng</h1>
          <p className="text-gray-500 mt-2 font-medium">Quản lý tài khoản đăng nhập và phân quyền hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setUserToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus size={20} /> Tạo Mới
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo username, tên nhân viên..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="p-5 font-bold uppercase tracking-wider text-[10px] text-center w-12">STT</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Username</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Liên kết Nhân viên</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Vai trò</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-right">Điều khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center font-bold text-gray-400">Đang tải tài khoản...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">Không tìm thấy Tài khoản nào.</td></tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                    <td className="p-5 text-center font-bold text-gray-400 text-xs">{index + 1}</td>
                    <td className="p-5 font-mono text-sm font-bold text-gray-500">{u.username}</td>
                    <td className="p-5 font-bold text-gray-900 dark:text-white">
                      {u.employee ? u.employee.fullName : <span className="text-gray-400 font-medium">Chưa liên kết</span>}
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1.5 rounded-[0.4rem] text-[11px] font-extrabold tracking-widest uppercase shadow-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {u.role?.name || 'USER'}
                      </span>
                    </td>
                    <td className="p-5 text-right flex items-center justify-end gap-1">
                      <button onClick={() => { setUserToEdit(u); setIsFormOpen(true); }} className="p-2.5 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition" title="Chửa sửa">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && <UserFormModal onClose={() => setIsFormOpen(false)} onSaved={fetchUsers} userToEdit={userToEdit} />}
    </div>
  );
};
