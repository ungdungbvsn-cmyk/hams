import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Edit, Trash2, Search, Box } from 'lucide-react';
import { EquipmentTypeFormModal } from '../components/EquipmentTypeFormModal';

export const EquipmentTypeList = () => {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/equipment-types');
      setTypes(data);
    } catch (error) {
      console.error('Failed to fetch equipment types');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa loại thiết bị này?')) return;
    try {
      await apiClient.delete(`/equipment-types/${id}`);
      fetchTypes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi xóa');
    }
  };

  const filteredTypes = types.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
            <Box size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loại Thiết bị</h1>
            <p className="text-gray-500 text-sm mt-0.5">Quản lý danh mục loại tài sản và thiết bị y tế</p>
          </div>
        </div>
        <button 
          onClick={() => { setSelectedType(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold font-sans shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Thêm Loại Mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hoặc tên loại..."
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
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Mã Loại (matb)</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Tên Loại (tentb)</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">Mô tả</th>
                <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500 font-medium">Đang tải dữ liệu...</td></tr>
              ) : filteredTypes.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500 font-medium">Không tìm thấy loại thiết bị nào.</td></tr>
              ) : filteredTypes.map((type, index) => (
                <tr key={type.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition group">
                  <td className="py-4 px-6 text-center font-bold text-gray-400 text-xs">{index + 1}</td>
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded text-sm">{type.code}</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{type.name}</td>
                  <td className="py-4 px-6 text-gray-500 dark:text-gray-400 text-sm italic">{type.description || '---'}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedType(type); setIsModalOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(type.id)}
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

      <EquipmentTypeFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchTypes}
        typeToEdit={selectedType}
      />
    </div>
  );
};
