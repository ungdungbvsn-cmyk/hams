import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Search, MonitorPlay, QrCode, FileSpreadsheet, Trash2, Edit, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AssetFormModal } from '../components/AssetFormModal';
import { ExcelImportModal } from '../components/ExcelImportModal';
import { BreakdownReportModal } from '../components/BreakdownReportModal';
import { TransferAssetModal } from '../components/TransferAssetModal';
import { QRScannerModal } from '../components/QRScannerModal';
import { useAuthStore } from '../store/useAuthStore';

interface Asset {
  id: number;
  assetCode: string;
  name: string;
  equipmentType: { name: string };
  department: { name: string };
  statusId: number;
  statusConfig?: { tentt: string };
  unit: string;
  group?: string;
  requiresCalibration: boolean;
  calibrationCycle: number;
  maintenances?: any[];
}

export const AssetList = () => {
  const { user } = useAuthStore();
  const hasManageAssets = user?.role?.name?.toUpperCase() === 'ADMIN' || (user?.permissions as any)?.manageAssets;
  const hasImportExcel = user?.role?.name?.toUpperCase() === 'ADMIN' || (user?.permissions as any)?.importExcel;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [assetToTransfer, setAssetToTransfer] = useState<Asset | null>(null);
  const [selectedAssetForBreakdown, setSelectedAssetForBreakdown] = useState<Asset | null>(null);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [groupFilter, setGroupFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const [assetRes, unifiedRes] = await Promise.all([
        apiClient.get('/assets'),
        apiClient.get('/master/unified')
      ]);
      setAssets(assetRes.data);
      setEquipmentTypes(unifiedRes.data.equipmentTypes);
      setDepartments(unifiedRes.data.departments);
    } catch (error) {
      console.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/assets/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Danh_sach_tai_san.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Lỗi xuất file Excel. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('CẢNH BÁO: Quá trình xoá vĩnh viễn!\nBạn có chắc chắn muốn xóa tài sản/thiết bị này? Tất cả dữ liệu liên quan sẽ bị xoá cùng lúc.')) {
      try {
        await apiClient.delete(`/assets/${id}`);
        fetchAssets();
      } catch (error) {
        alert('Không thể xóa tài sản. Vui lòng kiểm tra lại quyền hoặc ràng buộc dữ liệu.');
      }
    }
  };

  const getStatusColor = (statusId: number) => {
    switch(statusId) {
      case 0: return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      case 3: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      case 4: case 5: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400';
      case 1: case 2: return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      case 6: return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.assetCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'all' || a.group === groupFilter;
    const matchesType = typeFilter === 'all' || a.equipmentType?.name === typeFilter;
    const matchesDept = departmentFilter === 'all' || a.department?.name === departmentFilter;
    return matchesSearch && matchesGroup && matchesType && matchesDept;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const currentAssets = filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchTerm, groupFilter, typeFilter, departmentFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Quản lý Tài sản</h1>
          <p className="text-gray-500 mt-2 font-medium">Danh sách toàn bộ thiết bị và tài sản trong hệ thống y tế</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            <QrCode size={20} /> Quét QR
          </button>
          <Link to={`/assets/print-qrs?group=${encodeURIComponent(groupFilter)}&type=${encodeURIComponent(typeFilter)}&department=${encodeURIComponent(departmentFilter)}&search=${encodeURIComponent(searchTerm)}`} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95">
            <QrCode size={20} /> In tất cả mã QR
          </Link>
          {hasImportExcel && (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsImportOpen(true)} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95">
                <FileSpreadsheet size={20} /> Nhập Excel
              </button>
            </div>
          )}
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <FileSpreadsheet size={20} /> Xuất Excel
          </button>
          {hasManageAssets && (
            <button onClick={() => { setAssetToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Plus size={20} /> Thêm Mới
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã, tên tài sản..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Tất cả Nhóm</option>
              <option value="Thiết bị y tế">Thiết bị y tế</option>
              <option value="Thiết bị CNTT">Thiết bị CNTT</option>
              <option value="Thiết bị hành chính">Thiết bị hành chính</option>
            </select>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Tất cả Loại</option>
              {equipmentTypes.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Tất cả Khoa phòng</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="p-5 font-bold uppercase tracking-wider text-[10px] text-center w-12">STT</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-center w-24">Mã Thiết bị</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Thông tin Tổng quan</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Phân loại</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-center">Nhóm</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-center">ĐVT</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-center">Khoa / Phòng ban</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-center">Tình trạng</th>
                <th className="p-5 text-gray-400 font-bold uppercase text-[11px] tracking-wider text-center">Kiểm định</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs text-right">Điều khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={10} className="p-10 text-center font-bold text-gray-400 font-mono">Đang đồng bộ dữ liệu Hệ thống...</td></tr>
              ) : currentAssets.length === 0 ? (
                <tr><td colSpan={10} className="p-12 text-center text-gray-500 font-medium italic">Không tìm thấy tài sản nào phù hợp với bộ lọc.</td></tr>
              ) : (
                currentAssets.map((asset, index) => (
                  <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                    <td className="p-5 text-center font-bold text-gray-400 text-xs">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="p-5 font-mono text-[11px] font-bold text-primary dark:text-purple-400 text-center">
                      {asset.assetCode}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 border border-gray-200/50 dark:border-gray-700/50 group-hover:bg-primary/10 group-hover:text-primary transition shadow-sm">
                          <MonitorPlay size={20} />
                        </div>
                        <span className="font-extrabold text-gray-900 dark:text-white text-[15px] group-hover:text-primary transition">{asset.name}</span>
                      </div>
                    </td>
                    <td className="p-5 font-semibold text-gray-600 dark:text-gray-300">{asset.equipmentType?.name || '---'}</td>
                    <td className="p-5">
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase border border-blue-100 dark:border-blue-800">
                        {(asset as any).group || 'Chưa nhóm'}
                      </span>
                    </td>
                    <td className="p-5 font-semibold text-gray-600 dark:text-gray-300">{asset.unit || 'Cái'}</td>
                    <td className="p-5 font-semibold text-gray-600 dark:text-gray-300">
                      {asset.department?.name ? (
                         <span className="bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-md">{asset.department.name}</span>
                      ) : 'Chưa thiết lập'}
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-[0.4rem] text-[11px] font-extrabold tracking-widest uppercase shadow-sm ${getStatusColor(asset.statusId)}`}>
                        {asset.statusConfig?.tentt || 'N/A'}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center">
                        {asset.requiresCalibration ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <ShieldCheck className="text-green-500" size={18} />
                            <span className="text-[9px] font-bold text-green-600 uppercase italic-font">{asset.calibrationCycle} ngày</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">---</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-right flex items-center justify-end gap-1">
                      <Link to={`/assets/${asset.id}`} className="p-2.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:shadow-sm transition" title="In Mã QRCode Traceability">
                        <QrCode size={18} />
                      </Link>
                      {(user?.role?.name === 'ADMIN' || (user?.permissions as any)?.accessMovement) && (
                        <button onClick={() => { setAssetToTransfer(asset); setIsTransferOpen(true); }} className="p-2.5 rounded-xl text-blue-500 hover:text-white hover:bg-blue-500 transition shadow-sm" title="Luân chuyển thiết bị">
                          <RefreshCw size={18} />
                        </button>
                      )}
                      {hasManageAssets && (
                        <button onClick={() => { setAssetToEdit(asset); setIsFormOpen(true); }} className="p-2.5 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/20 hover:shadow-sm transition" title="Chỉnh sửa Chi tiết">
                          <Edit size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => { 
                          console.log('Opening breakdown report for:', asset.name);
                          setSelectedAssetForBreakdown(asset); 
                          setIsBreakdownOpen(true); 
                        }} 
                        className="p-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 hover:shadow-sm transition" 
                        title="Báo cáo hỏng hóc"
                        disabled={asset.statusId === 1 || asset.statusId === 4}
                      >
                        <AlertTriangle size={18} />
                      </button>
                      {hasManageAssets && (
                        <button onClick={() => handleDelete(asset.id)} className="p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 hover:shadow-sm transition" title="Xóa Tài sản">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/10">
            <div className="text-sm text-gray-500 font-medium">
              Hiển thị <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredAssets.length)}</span> trong tổng số <span className="font-bold">{filteredAssets.length}</span> tài sản
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                Trang trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold transition ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>

      <AssetFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSaved={fetchAssets} 
        assetToEdit={assetToEdit} 
      />
      <ExcelImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onImported={fetchAssets} 
      />
      <TransferAssetModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSaved={fetchAssets}
        asset={assetToTransfer}
      />
      <BreakdownReportModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        onReported={fetchAssets}
        asset={selectedAssetForBreakdown}
      />
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};
